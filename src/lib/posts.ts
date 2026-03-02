import fs from "fs";
import path from "path";

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
  crawled_at: string;
}

export function getPosts(): Post[] {
  const filePath = path.join(process.cwd(), "public", "data", "posts.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
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
  return filtered.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function getPostsByPeriod(period: string): Post[] {
  const posts = getPosts();
  return posts
    .filter((p) => p.period === period)
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
