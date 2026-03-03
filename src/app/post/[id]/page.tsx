import { getPostById, getRelatedPosts, sourceColors, categoryMap } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import ViewCounter from "@/components/ViewCounter";
import Link from "next/link";

function sanitizeHtml(html: string): string {
  // script, iframe, object, embed, form 태그 제거
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

  // on* 이벤트 핸들러 제거 (onclick, onerror 등)
  html = html.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "");
  html = html.replace(/\s+on\w+\s*=\s*'[^']*'/gi, "");
  html = html.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");

  // javascript: URL 제거
  html = html.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"');
  html = html.replace(/src\s*=\s*"javascript:[^"]*"/gi, "");
  html = html.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
  html = html.replace(/src\s*=\s*'javascript:[^']*'/gi, "");

  // 에펨코리아 serverLog 등 불필요한 텍스트 제거
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
  return html;
}

function getPopularityLevel(post: Post): { label: string; color: string } {
  const score = post.view_count + post.like_count * 10 + post.comment_count * 5;
  if (score >= 50000) return { label: "화제의 글", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
  if (score >= 20000) return { label: "인기글", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" };
  if (score >= 5000) return { label: "주목받는 글", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" };
  return { label: "커뮤니티 글", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
}

function generateCurationIntro(post: Post): string {
  const catName = categoryMap[post.category] || post.category;
  const popularity = getPopularityLevel(post);
  const dateStr = new Date(post.crawled_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const parts: string[] = [];

  // 출처와 카테고리 소개
  parts.push(
    `${post.source_name}의 ${catName} 게시판에서 ${dateStr}에 화제가 된 게시물입니다.`
  );

  // 인기도 기반 설명
  if (post.view_count > 10000) {
    parts.push(`조회수 ${post.view_count.toLocaleString()}회를 돌파하며 많은 관심을 받고 있습니다.`);
  } else if (post.view_count > 1000) {
    parts.push(`조회수 ${post.view_count.toLocaleString()}회를 기록한 게시물입니다.`);
  }

  if (post.like_count > 500) {
    parts.push(`추천 ${post.like_count.toLocaleString()}개로 커뮤니티 이용자들의 높은 공감을 얻었습니다.`);
  } else if (post.like_count > 100) {
    parts.push(`추천 ${post.like_count.toLocaleString()}개를 받은 게시물입니다.`);
  }

  if (post.comment_count > 200) {
    parts.push(`댓글 ${post.comment_count.toLocaleString()}개가 달리며 활발한 토론이 이루어지고 있습니다.`);
  } else if (post.comment_count > 50) {
    parts.push(`댓글 ${post.comment_count.toLocaleString()}개로 이용자들의 반응이 이어지고 있습니다.`);
  }

  return parts.join(" ");
}

function generateEngagementSummary(post: Post): string {
  const total = post.view_count + post.like_count + post.comment_count;
  if (total === 0) return "";

  const likeRatio = post.view_count > 0
    ? ((post.like_count / post.view_count) * 100).toFixed(1)
    : "0";

  const parts: string[] = [];

  if (post.view_count > 0 && post.like_count > 0) {
    parts.push(`조회 대비 추천 비율 ${likeRatio}%`);
  }

  if (post.comment_count > 0 && post.like_count > 0) {
    const commentPerLike = (post.comment_count / post.like_count).toFixed(1);
    if (parseFloat(commentPerLike) > 1) {
      parts.push("추천보다 댓글이 많아 논의가 활발한 게시물");
    } else if (parseFloat(commentPerLike) < 0.3) {
      parts.push("댓글보다 추천이 압도적으로 많은 공감형 게시물");
    }
  }

  return parts.join(" / ");
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
  const popularity = getPopularityLevel(post);
  const curationIntro = generateCurationIntro(post);
  const engagementSummary = generateEngagementSummary(post);

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
      {/* 인기도 뱃지 + 제목 */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`${popularity.color} px-2 py-0.5 rounded text-xs font-bold`}>
          {popularity.label}
        </span>
        <span className={`${colorClass} px-2 py-0.5 rounded text-xs font-medium`}>
          {post.source_name}
        </span>
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
        <span>조회 {post.view_count.toLocaleString()}</span>
        <ViewCounter postId={post.id} />
        <span>추천 {post.like_count.toLocaleString()}</span>
        <span>댓글 {post.comment_count.toLocaleString()}</span>
      </div>

      {/* 큐레이션 소개 */}
      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {curationIntro}
        </p>
        {engagementSummary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {engagementSummary}
          </p>
        )}
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

      {/* 출처 및 큐레이션 안내 */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
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
          본 게시물은 {post.source_name}에서 수집된 인기 콘텐츠이며, 원본 저작권은 원저작자에게 있습니다.
          커뮤니티 인기글은 각 커뮤니티의 화제 게시물을 선별하여 소개하는 큐레이션 서비스입니다.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
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

      {/* 관련 게시글 추천 */}
      <RelatedPosts currentId={post.id} category={post.category} />
    </article>
  );
}

function RelatedPosts({ currentId, category }: { currentId: string; category: string }) {
  const related = getRelatedPosts(currentId, category, 6);
  if (related.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">추천 게시글</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((p) => {
          const color = sourceColors[p.source] || "bg-gray-100 text-gray-700";
          return (
            <Link
              key={p.id}
              href={`/post/${p.id}`}
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
