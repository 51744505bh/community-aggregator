import { getPostById, getRelatedPosts, sourceColors, categoryMap, getCommunityUrl, cleanCommentText, cleanSummaryText } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import ViewCounter from "@/components/ViewCounter";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

function sanitizeHtml(html: string): string {
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<\/script>/gi, "");
  html = html.replace(/<script[^>]*>/gi, "");
  html = html.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
  html = html.replace(/<iframe[^>]*>/gi, "");
  html = html.replace(/<object[\s\S]*?<\/object>/gi, "");
  html = html.replace(/<embed[^>]*>/gi, "");
  html = html.replace(/<form[\s\S]*?<\/form>/gi, "");
  html = html.replace(/<link[^>]*>/gi, "");
  html = html.replace(/<meta[^>]*>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  html = html.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  html = html.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  html = html.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");
  html = html.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"');
  html = html.replace(/src\s*=\s*"javascript:[^"]*"/gi, "");
  html = html.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
  html = html.replace(/src\s*=\s*'javascript:[^']*'/gi, "");
  html = html.replace(/serverLog[:\s]*\w*\s*__LAZY__/gi, "");
  return html;
}

const PROXY_DOMAINS = ["dcinside.co.kr", "dcinside.com"];

function needsProxy(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return PROXY_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}

function rewriteMediaUrl(url: string): { src: string; attrs: string } {
  if (needsProxy(url)) {
    return { src: `/api/image?url=${encodeURIComponent(url)}`, attrs: "" };
  }
  return { src: url, attrs: ' referrerpolicy="no-referrer"' };
}

function proxyMedia(html: string): string {
  html = sanitizeHtml(html);
  html = html.replace(
    /<img([^>]*?)src="(https?:\/\/[^"]+)"([^>]*?)>/g,
    (match, before, url, after) => {
      const r = rewriteMediaUrl(url);
      return `<img${before}src="${r.src}"${r.attrs} loading="lazy"${after}>`;
    }
  );
  html = html.replace(
    /<video([^>]*?)src="(https?:\/\/[^"]+)"([^>]*?)>/g,
    (match, before, url, after) => {
      const r = rewriteMediaUrl(url);
      return `<video${before}src="${r.src}"${r.attrs}${after}>`;
    }
  );
  // video 폴백 텍스트 제거
  html = html.replace(/<video([^>]*)>([\s\S]*?)<\/video>/gi, "<video$1></video>");
  return html;
}

function getPopularityLevel(post: Post): { label: string; color: string } {
  const score = post.view_count + post.like_count * 10 + post.comment_count * 5;
  if (score >= 50000) return { label: "화제의 글", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
  if (score >= 20000) return { label: "인기글", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" };
  if (score >= 5000) return { label: "주목받는 글", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" };
  return { label: "커뮤니티 글", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}): Promise<Metadata> {
  const { source, id } = await params;
  const postId = `${source}_${id}`;
  const post = getPostById(postId);

  if (!post) {
    return { title: "게시글을 찾을 수 없습니다 - Dripszone" };
  }

  return {
    title: `${post.title} - Dripszone`,
    description: post.summary || `${post.source_name}에서 화제가 된 게시물입니다.`,
    robots: { index: false, follow: true },
  };
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const { source, id } = await params;
  const postId = `${source}_${id}`;
  const post = getPostById(postId);

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          게시글을 찾을 수 없습니다
        </h1>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const colorClass = sourceColors[post.source] || "bg-gray-100 text-gray-700";
  const proxiedContent = post.content ? proxyMedia(post.content) : "";
  const popularity = getPopularityLevel(post);
  const catName = categoryMap[post.category] || post.category;
  const dateStr = new Date(post.crawled_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", url: "https://www.dripszone.com" },
          { name: "실시간", url: "https://www.dripszone.com/live" },
          { name: post.source_name, url: `https://www.dripszone.com/community/${source}/${id}` },
        ]}
      />
      {/* 브레드크럼 */}
      <nav className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">홈</Link>
        <span className="mx-1">/</span>
        <Link href="/live" className="hover:text-gray-700 dark:hover:text-gray-200">실시간</Link>
        <span className="mx-1">/</span>
        <span>{post.source_name}</span>
      </nav>

      {/* 인기도 뱃지 + 제목 */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`${popularity.color} px-2 py-0.5 rounded text-xs font-bold`}>
          {popularity.label}
        </span>
        <span className={`${colorClass} px-2 py-0.5 rounded text-xs font-medium`}>
          {post.source_name}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{catName}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>
          {new Date(post.crawled_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {post.view_count > 0 && <span>조회 {post.view_count.toLocaleString()}</span>}
        <ViewCounter postId={post.id} />
        <span>추천 {post.like_count.toLocaleString()}</span>
        <span>댓글 {post.comment_count.toLocaleString()}</span>
        <LikeButton postId={post.id} />
        <ShareButton postId={post.id} />
      </div>

      {/* 10초 요약 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <h2 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">10초 요약</h2>
        <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
          {post.summary ? cleanSummaryText(post.summary) : `${post.source_name}의 ${catName} 게시판에서 ${dateStr}에 화제가 된 게시물입니다.`}
        </p>
      </div>

      {/* 본문 콘텐츠 — 광고 없음 */}
      {proxiedContent && (
        <div
          className="post-content my-4 leading-relaxed text-gray-800 dark:text-gray-200"
          style={{ wordBreak: "break-word" }}
          dangerouslySetInnerHTML={{ __html: proxiedContent }}
        />
      )}

      {!post.content && post.image_urls && post.image_urls.length > 0 && (
        <div className="my-4 space-y-3">
          {post.image_urls.map((imgUrl, i) => {
            const r = rewriteMediaUrl(imgUrl);
            return (
              <img
                key={i}
                src={r.src}
                referrerPolicy={needsProxy(imgUrl) ? undefined : "no-referrer"}
                alt=""
                className="w-full rounded"
                loading="lazy"
              />
            );
          })}
        </div>
      )}

      {/* 반응 포인트 */}
      {post.top_comments && post.top_comments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            반응 포인트
          </h2>
          <div className="space-y-2">
            {post.top_comments.map((comment, i) => (
              <div
                key={i}
                className="flex gap-3 items-start bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {cleanCommentText(comment.text)}
                  </p>
                  {comment.likes > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">
                      추천 {comment.likes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사이트 댓글 */}
      <CommentSection postId={post.id} />

      {/* 관련 Dripszone 기사 안내 */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          이 주제에 대한 Dripszone 정리 기사가 준비되면 여기에 링크됩니다.
        </p>
      </div>

      {/* 출처 */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          <span className="font-semibold text-gray-700 dark:text-gray-300">출처:</span>{" "}
          {post.source_name} ({new URL(post.url).hostname})
        </p>
        <p>
          <span className="font-semibold text-gray-700 dark:text-gray-300">수집일:</span>{" "}
          {new Date(post.crawled_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="pt-1">
          이 페이지는 {post.source_name}에서 수집된 커뮤니티 인기 콘텐츠입니다.
          원본 저작권은 원저작자에게 있으며, 저작권 관련 요청은{" "}
          <Link href="/copyright" className="text-blue-600 dark:text-blue-400 hover:underline">저작권 안내</Link>
          를 참고해주세요.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          &larr; 홈으로
        </Link>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-block px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          원본 사이트에서 보기
        </a>
      </div>

      {/* 관련 게시글 */}
      <RelatedPosts currentId={post.id} category={post.category} />
    </article>
  );
}

function RelatedPosts({ currentId, category }: { currentId: string; category: string }) {
  const related = getRelatedPosts(currentId, category, 6);
  if (related.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">관련 게시글</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((p) => {
          const color = sourceColors[p.source] || "bg-gray-100 text-gray-700";
          const url = getCommunityUrl(p);
          return (
            <Link
              key={p.id}
              href={url}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {p.thumbnail_url && (
                <img
                  src={needsProxy(p.thumbnail_url) ? `/api/image?url=${encodeURIComponent(p.thumbnail_url)}` : p.thumbnail_url}
                  referrerPolicy={needsProxy(p.thumbnail_url) ? undefined : "no-referrer"}
                  alt=""
                  className="w-20 h-14 object-cover rounded flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{p.title}</p>
                <span className={`${color} px-1.5 py-0.5 rounded text-[10px] font-medium mt-1 inline-block`}>
                  {p.source_name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
