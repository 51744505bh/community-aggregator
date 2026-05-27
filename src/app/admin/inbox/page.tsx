import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { syncCurationCandidates } from "@/lib/admin/curation-sync";
import { getCommunityUrl, getMixedRecentPosts } from "@/lib/posts";
import type { Metadata } from "next";
import CurationInbox from "@/components/admin/curation-inbox";

export const metadata: Metadata = {
  title: "수집함 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminInboxPage() {
  await requireAdmin();
  const curatedPost = (prisma as typeof prisma & {
    curatedPost?: {
      findMany: (args: { orderBy: { updatedAt: "desc" } }) => Promise<Array<{
        postId: string;
        status: "PENDING" | "APPROVED" | "HIDDEN";
        bucket: "BEST_24H" | "BEST_WEEKLY" | "BEST_MONTHLY" | null;
        curatorName: string | null;
        customCategory: string | null;
      }>>;
    };
  }).curatedPost;

  const posts = getMixedRecentPosts(180);
  await syncCurationCandidates(posts);

  const decisions = curatedPost
    ? await curatedPost.findMany({
        orderBy: { updatedAt: "desc" },
      }).catch(() => [])
    : [];

  const decisionMap = new Map(decisions.map((decision) => [decision.postId, decision]));
  const items = posts.map((post) => {
    const decision = decisionMap.get(post.id);

    return {
      id: post.id,
      title: post.title,
      originalUrl: post.url,
      source: post.source,
      sourceName: post.source_name,
      category: decision?.customCategory || post.category,
      period: post.period,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      viewCount: post.view_count,
      crawledAt: post.crawled_at,
      crawledAtLabel: new Date(post.crawled_at).toISOString().slice(0, 16).replace("T", " "),
      communityPath: getCommunityUrl(post),
      decision: decision
        ? {
            status: decision.status,
            bucket: decision.bucket,
            curatorName: decision.curatorName,
            customCategory: decision.customCategory,
          }
        : null,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          수집함
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          자동 수집된 글을 보고 24시간, 주간, 월간 피드에 승인하거나 제외합니다.
        </p>
      </div>

      <CurationInbox items={items} />
    </div>
  );
}
