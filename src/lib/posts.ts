import fs from "fs";
import path from "path";

export interface PostComment {
  text: string;
  likes: number;
}

export interface Post {
  id: string;
  source: string;
  source_name: string;
  category: string;
  period: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  image_urls: string[];
  content: string;
  summary: string;
  view_count: number;
  comment_count: number;
  like_count: number;
  top_comments?: PostComment[];
  crawled_at: string;
}

const VIDEO_NOISE_RE = /Video\s*Player\s*Video\s*태그를\s*지원하지\s*않는\s*브라우저입니다[\s\S]*?(?:0\.25x|$)/gi;
const VIDEO_NOISE_SHORT_RE = /Video\s*태그를\s*지원하지\s*않는\s*브라우저입니다[.\s]*/gi;

function cleanSummary(s: string): string {
  return s.replace(VIDEO_NOISE_RE, "").replace(VIDEO_NOISE_SHORT_RE, "").replace(/^[\s.]+/, "").trim();
}

export function getPosts(): Post[] {
  const filePath = path.join(process.cwd(), "public", "data", "posts.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const posts: Post[] = JSON.parse(data);
    for (const p of posts) {
      if (p.summary) p.summary = cleanSummary(p.summary);
    }
    return posts;
  } catch {
    return [];
  }
}

export function getPostById(id: string): Post | undefined {
  const posts = getPosts();
  return posts.find((p) => p.id === id);
}

export function getPostsByCategory(category: string): Post[] {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.category === category);
  // 같은 ID가 여러 period에 있을 수 있으므로 중복 제거
  const seen = new Set<string>();
  return filtered
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime()
    );
}

export function getPostsByPeriod(period: string): Post[] {
  const posts = getPosts();

  let filtered = posts.filter((p) => p.period === period);

  // 베스트 탭(실시간/주간/월간)에서 정보글(info) 제외 — 정보/꿀팁 탭에서 별도 노출
  filtered = filtered.filter((p) => p.category !== "info");

  // 월간에서 주간과 중복되는 글 제외
  if (period === "monthly") {
    const weeklyIds = new Set(
      posts.filter((p) => p.period === "weekly").map((p) => p.id)
    );
    filtered = filtered.filter((p) => !weeklyIds.has(p.id));
  }

  // 중복 ID 제거
  const seen = new Set<string>();
  return filtered
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime()
    );
}

export function searchPosts(query: string): Post[] {
  const posts = getPosts();
  const q = query.toLowerCase();
  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.summary && p.summary.toLowerCase().includes(q))
  );
  // 중복 제거
  const seen = new Set<string>();
  return filtered.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function getPostsSortedByViews(): Post[] {
  const posts = getPosts();
  return posts.sort((a, b) => b.view_count - a.view_count);
}

export function getPostsSortedByRecent(): Post[] {
  const posts = getPosts();
  return posts.sort(
    (a, b) =>
      new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime()
  );
}

export function getRelatedPosts(currentId: string, category: string, count: number = 6): Post[] {
  const posts = getPosts();
  const seen = new Set<string>([currentId]);
  const related: Post[] = [];

  // 같은 카테고리에서 최신글 우선
  const sameCat = posts
    .filter((p) => p.category === category && p.id !== currentId)
    .sort((a, b) => new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime());

  for (const p of sameCat) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    related.push(p);
    if (related.length >= count) return related;
  }

  // 부족하면 다른 카테고리에서 채우기
  const others = posts
    .filter((p) => p.id !== currentId && !seen.has(p.id))
    .sort((a, b) => new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime());

  for (const p of others) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    related.push(p);
    if (related.length >= count) break;
  }

  return related;
}

export const categoryMap: Record<string, string> = {
  humor: "유머",
  issue: "이슈",
  info: "정보/꿀팁",
};

export const sourceColors: Record<string, string> = {
  fmkorea: "bg-orange-100 text-orange-700",
  dcinside: "bg-blue-100 text-blue-700",
  ruliweb: "bg-green-100 text-green-700",
  bobaedream: "bg-purple-100 text-purple-700",
  dogdrip: "bg-yellow-100 text-yellow-700",
  clien: "bg-teal-100 text-teal-700",
  ppomppu: "bg-red-100 text-red-700",
};

const SENSITIVE_PATTERNS = [
  /ㅇㅎ/,
  /후방/,
  /19금/,
  /성인/,
  /야동/,
  /노출/,
  /섹스/,
  /자살/,
  /혐오/,
  /살인/,
  /시체/,
  /고어/,
  /패드립/,
  /흉기/,
  /강간/,
  /몰카/,
  /불법촬영/,
];

export function isSensitivePost(post: Post): boolean {
  const text = post.title;
  return SENSITIVE_PATTERNS.some((re) => re.test(text));
}

export function getSafePosts(posts: Post[]): Post[] {
  return posts.filter((p) => !isSensitivePost(p));
}

export function parsePostId(id: string): { source: string; rawId: string } {
  const idx = id.indexOf("_");
  if (idx === -1) return { source: "", rawId: id };
  return { source: id.substring(0, idx), rawId: id.substring(idx + 1) };
}

export function getCommunityUrl(post: Post): string {
  const { source, rawId } = parsePostId(post.id);
  return `/community/${source}/${rawId}`;
}

export function getTopPostsByCategory(category: string, count: number): Post[] {
  const posts = getPosts();
  const seen = new Set<string>();
  return posts
    .filter((p) => p.category === category)
    .sort((a, b) => {
      const scoreA = a.view_count + a.like_count * 10 + a.comment_count * 5;
      const scoreB = b.view_count + b.like_count * 10 + b.comment_count * 5;
      return scoreB - scoreA;
    })
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .slice(0, count);
}

export function getRecentPosts(count: number): Post[] {
  const posts = getPosts();
  const seen = new Set<string>();
  return posts
    .sort((a, b) => new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime())
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .slice(0, count);
}

export function getTrendingKeywords(count: number = 10): string[] {
  const posts = getPosts();
  const recent = posts
    .sort((a, b) => new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime())
    .slice(0, 100);

  const wordCount = new Map<string, number>();
  for (const p of recent) {
    const words = p.title
      .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 2);
    for (const w of words) {
      wordCount.set(w, (wordCount.get(w) || 0) + 1);
    }
  }

  return Array.from(wordCount.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w);
}
