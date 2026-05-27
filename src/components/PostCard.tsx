import Link from "next/link";
import type { Post } from "@/lib/posts";
import { sourceColors, getCommunityUrl } from "@/lib/posts";

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
  const displayViews = post.cached_view_count ?? post.site_view_count ?? 0;
  const authorName = post.curator_name || "드립지기";

  return (
    <Link href={getCommunityUrl(post)} className="block">
      <div className="flex gap-3 border-b border-gray-100 bg-white px-4 py-4 transition-colors hover:bg-gray-50">
        {post.thumbnail_url && (
          <img
            {...getThumbnailProps(post.thumbnail_url)}
            alt=""
            className="hidden h-20 w-28 flex-shrink-0 rounded object-cover sm:block"
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="mb-2 line-clamp-2 text-[17px] font-bold leading-6 text-gray-900">
            {post.title}
          </h2>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className={`${colorClass} rounded px-1.5 py-0.5 text-[11px] font-semibold`}>
              {post.source_name}
            </span>
            <span className="font-medium text-gray-700">{authorName}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-400">
              {new Date(post.crawled_at).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span>조회수 {displayViews.toLocaleString()}</span>
            <span>추천 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
