import Link from "next/link";
import type { Post } from "@/lib/posts";
import { sourceColors } from "@/lib/posts";

const PROXY_DOMAINS = ["dcinside.co.kr", "dcinside.com"];

function getThumbnailProps(url: string) {
  try {
    const hostname = new URL(url).hostname;
    if (PROXY_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d))) {
      return { src: `/api/image?url=${encodeURIComponent(url)}` };
    }
  } catch {}
  return { src: url, referrerPolicy: "no-referrer" as const };
}

export default function PostCard({ post }: { post: Post }) {
  const colorClass = sourceColors[post.source] || "bg-gray-100 text-gray-700";

  return (
    <Link href={`/post/${post.id}`} className="block">
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        {post.thumbnail_url && (
          <img
            {...getThumbnailProps(post.thumbnail_url)}
            alt=""
            className="w-32 h-24 object-cover rounded flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {post.title}
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`${colorClass} px-2 py-0.5 rounded text-xs font-medium`}
            >
              {post.source_name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(post.crawled_at).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {post.summary && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
              {post.summary}
            </p>
          )}
          <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500">
            {post.view_count > 0 && <span>조회 {post.view_count.toLocaleString()}</span>}
            <span>추천 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
