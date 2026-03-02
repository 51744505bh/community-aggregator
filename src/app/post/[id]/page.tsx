import { getPostById, sourceColors } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import Link from "next/link";

function proxyMedia(html: string): string {
  html = html.replace(
    /<img([^>]*?)src="(https?:\/\/[^"]+)"([^>]*?)>/g,
    (match, before, url, after) =>
      `<img${before}src="/api/image?url=${encodeURIComponent(url)}"${after}>`
  );
  html = html.replace(
    /<video([^>]*?)src="(https?:\/\/[^"]+)"([^>]*?)>/g,
    (match, before, url, after) =>
      `<video${before}src="/api/image?url=${encodeURIComponent(url)}"${after}>`
  );
  return html;
}

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getPostById(id);

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          게시글을 찾을 수 없습니다
        </h1>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const colorClass = sourceColors[post.source] || "bg-gray-100 text-gray-700";
  const proxiedContent = post.content ? proxyMedia(post.content) : "";

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className={`${colorClass} px-2 py-0.5 rounded text-xs font-medium`}>
          {post.source_name}
        </span>
        <span>
          {new Date(post.crawled_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>조회 {post.view_count.toLocaleString()}</span>
        <span>추천 {post.like_count.toLocaleString()}</span>
        <span>댓글 {post.comment_count.toLocaleString()}</span>
      </div>

      <AdBanner type="adsense" />

      {proxiedContent && (
        <div
          className="post-content my-4 leading-relaxed text-gray-800 dark:text-gray-200"
          style={{ wordBreak: "break-word" }}
          dangerouslySetInnerHTML={{ __html: proxiedContent }}
        />
      )}

      {!post.content && post.image_urls && post.image_urls.length > 0 && (
        <div className="my-4 space-y-3">
          {post.image_urls.map((imgUrl, i) => (
            <img
              key={i}
              src={`/api/image?url=${encodeURIComponent(imgUrl)}`}
              alt=""
              className="w-full rounded"
              loading="lazy"
            />
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          &larr; 목록으로
        </Link>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          원본 사이트에서 보기
        </a>
      </div>

      <AdBanner type="coupang" />
    </article>
  );
}
