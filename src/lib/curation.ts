import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getPostById,
  getPosts,
  type Post,
} from "@/lib/posts";

export type CuratedBucket = "BEST_24H" | "BEST_WEEKLY" | "BEST_MONTHLY";

export const DEFAULT_CURATOR_NAME = "드립지기";

function isPublishedDecision(decision: Pick<CuratedDecisionRecord, "status" | "bucket"> | null) {
  return Boolean(decision && decision.bucket && (decision.status === "APPROVED" || decision.status === "PENDING"));
}

function isApprovedDecision(decision: Pick<CuratedDecisionRecord, "status"> | null) {
  return Boolean(decision && decision.status === "APPROVED");
}

function periodForBucket(bucket: CuratedBucket): string {
  if (bucket === "BEST_24H") return "daily";
  if (bucket === "BEST_WEEKLY") return "weekly";
  return "monthly";
}

type CuratedDecisionRecord = {
  id: string;
  postId: string;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  bucket: CuratedBucket | null;
  rank: number | null;
  note: string | null;
  curatorName: string | null;
  customCategory: string | null;
  customTitle: string | null;
  customSummary: string | null;
  customBodyMd: string | null;
  cachedViewCount: number | null;
  updatedAt: Date;
};

function getCuratedDelegate() {
  return (prisma as typeof prisma & {
    curatedPost?: {
      findMany: (args: {
        where?: Record<string, unknown>;
        orderBy?: Array<Record<string, "asc" | "desc">>;
      }) => Promise<CuratedDecisionRecord[]>;
      findUnique: (args: { where: { postId: string } }) => Promise<CuratedDecisionRecord | null>;
    };
    post_views?: {
      findMany: (args: {
        where: { post_id: { in: string[] } };
        select: { post_id: true; view_count: true };
      }) => Promise<Array<{ post_id: string; view_count: number | null }>>;
      findUnique: (args: {
        where: { post_id: string };
        select: { view_count: true };
      }) => Promise<{ view_count: number | null } | null>;
    };
  }).curatedPost;
}

function getPostViewsDelegate() {
  return (prisma as typeof prisma & {
    post_views?: {
      findMany: (args: {
        where?: { post_id?: { in: string[] } };
        select: { post_id: true; view_count: true };
      }) => Promise<Array<{ post_id: string; view_count: number | null }>>;
      findUnique: (args: {
        where: { post_id: string };
        select: { view_count: true };
      }) => Promise<{ view_count: number | null } | null>;
    };
  }).post_views;
}

const getCachedSiteViews = unstable_cache(
  async () => {
    const postViews = getPostViewsDelegate();
    if (!postViews) return [] as Array<{ post_id: string; view_count: number | null }>;

    try {
      return await postViews.findMany({
        select: { post_id: true, view_count: true },
      });
    } catch {
      return [] as Array<{ post_id: string; view_count: number | null }>;
    }
  },
  ["curated-site-views"],
  { revalidate: 1800 }
);

function applyDecisionToPost(post: Post, decision: CuratedDecisionRecord | null): Post {
  if (!decision) return post;

  return {
    ...post,
    category: decision.customCategory || post.category,
    curator_name:
      isPublishedDecision(decision) ? decision.curatorName || DEFAULT_CURATOR_NAME : decision.curatorName,
    custom_category: decision.customCategory,
    custom_title: decision.customTitle,
    custom_summary: decision.customSummary,
    custom_body_md: decision.customBodyMd,
    cached_view_count: decision.cachedViewCount,
    title: decision.customTitle || post.title,
    summary: decision.customSummary || post.summary,
  };
}

function toAutoCuratedPost(post: Post): Post {
  return {
    ...post,
    curator_name: post.curator_name || DEFAULT_CURATOR_NAME,
  };
}

function sortByCrawledAt(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime()
  );
}

function getFallbackFeedPosts(
  bucket: CuratedBucket,
  limit: number,
  decisionMap: Map<string, CuratedDecisionRecord>
): Post[] {
  const period = periodForBucket(bucket);
  const seen = new Set<string>();

  return sortByCrawledAt(getPosts())
    .filter((post) => {
      const decision = decisionMap.get(post.id);
      if (decision?.status === "HIDDEN") return false;
      if (seen.has(post.id)) return false;
      if (post.period !== period) return false;
      if (post.category === "info") return false;
      seen.add(post.id);
      return true;
    })
    .slice(0, limit)
    .map(toAutoCuratedPost);
}

function getFallbackCategoryPosts(
  category: string,
  limit: number,
  decisionMap: Map<string, CuratedDecisionRecord>
): Post[] {
  const seen = new Set<string>();

  return sortByCrawledAt(getPosts())
    .filter((post) => {
      const decision = decisionMap.get(post.id);
      const postCategory = decision?.customCategory || post.category;
      if (decision?.status === "HIDDEN") return false;
      if (seen.has(post.id)) return false;
      if (postCategory !== category) return false;
      seen.add(post.id);
      return true;
    })
    .slice(0, limit)
    .map((post) => applyDecisionToPost(toAutoCuratedPost(post), decisionMap.get(post.id) || null));
}

async function attachSiteViews(posts: Post[]): Promise<Post[]> {
  if (posts.length === 0) return posts;

  try {
    const rows = await getCachedSiteViews();
    const viewMap = new Map(rows.map((row) => [row.post_id, row.view_count || 0]));
    return posts.map((post) => ({
      ...post,
      site_view_count: viewMap.get(post.id) ?? 0,
    }));
  } catch {
    return posts.map((post) => ({ ...post, site_view_count: 0 }));
  }
}

export async function getCuratedDecision(postId: string): Promise<CuratedDecisionRecord | null> {
  const curatedPost = getCuratedDelegate();
  if (!curatedPost) return null;

  try {
    return await curatedPost.findUnique({
      where: { postId },
    });
  } catch {
    return null;
  }
}

export async function getCuratedPostById(
  postId: string,
  options?: { includeUnapproved?: boolean }
): Promise<Post | null> {
  const post = getPostById(postId);
  if (!post) return null;

  const decision = await getCuratedDecision(postId);
  if (!options?.includeUnapproved) {
    if (decision?.status === "HIDDEN") {
      return null;
    }
  }
  const [withViews] = await attachSiteViews([applyDecisionToPost(post, decision)]);
  return withViews || null;
}

export async function getCuratedFeed(bucket: CuratedBucket, limit: number): Promise<Post[]> {
  const curatedPost = getCuratedDelegate();

  if (!curatedPost) {
    return [];
  }

  try {
    const decisions = await curatedPost.findMany({
      where: {
        bucket,
      },
      orderBy: [{ rank: "asc" }, { updatedAt: "desc" }],
    });

    const postMap = new Map(getPosts().map((post) => [post.id, post]));
    const decisionMap = new Map(decisions.map((decision) => [decision.postId, decision]));

    const curated = decisions
      .map((decision) => {
        if (!isPublishedDecision(decision) || decision.bucket !== bucket) {
          return null;
        }
        const post = postMap.get(decision.postId);
        return post ? applyDecisionToPost(post, decision) : null;
      })
      .filter((post): post is Post => Boolean(post));

    if (curated.length >= limit) {
      return attachSiteViews(curated.slice(0, limit));
    }

    const seen = new Set(curated.map((post) => post.id));
    const fallback = getFallbackFeedPosts(bucket, limit - curated.length, decisionMap).filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });

    return attachSiteViews([...curated, ...fallback].slice(0, limit));
  } catch {
    return attachSiteViews(getFallbackFeedPosts(bucket, limit, new Map()));
  }
}

export async function getCuratedPostsByCategory(category: string, limit: number): Promise<Post[]> {
  const curatedPost = getCuratedDelegate();

  if (!curatedPost) {
    return [];
  }

  try {
    const decisions = await curatedPost.findMany({
      where: {
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    const postMap = new Map(getPosts().map((post) => [post.id, post]));
    const decisionMap = new Map(decisions.map((decision) => [decision.postId, decision]));

    const curated = decisions
      .map((decision) => {
        const post = postMap.get(decision.postId);
        if (
          !post ||
          !isApprovedDecision(decision) ||
          decision.customCategory !== category ||
          decision.note !== `manual-category:${category}`
        ) {
          return null;
        }
        const applied = applyDecisionToPost(post, decision);
        return applied;
      })
      .filter((post): post is Post => Boolean(post));

    if (curated.length >= limit) {
      return attachSiteViews(curated.slice(0, limit));
    }

    const seen = new Set(curated.map((post) => post.id));
    const fallback = getFallbackCategoryPosts(category, limit - curated.length, decisionMap).filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });

    return attachSiteViews([...curated, ...fallback].slice(0, limit));
  } catch {
    return attachSiteViews(getFallbackCategoryPosts(category, limit, new Map()));
  }
}
