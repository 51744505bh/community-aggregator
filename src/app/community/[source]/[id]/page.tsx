import { sourceColors, categoryMap, cleanCommentText, cleanSummaryText, getRelatedPosts, getCommunityUrl } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import LikeButton from "@/components/LikeButton";
import ShareButton from "@/components/ShareButton";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { getCuratedPostById } from "@/lib/curation";
import { checkRole } from "@/lib/auth/require-role";

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

function getCommentSkin(source: string) {
  switch (source) {
    case "dcinside":
      return {
        variant: "dcinside",
        shell: "bg-[#f5f7fb] border-[#cfd6df]",
        topBar: "bg-[#3b4890] border-[#2f3975]",
        titleBar: "bg-[#ffffff] border-[#d8dee6]",
        bubble: "bg-[#ffffff] border-[#d8dee6]",
        badge: "bg-[#3b4890] text-white",
        nickname: "ㅇㅇ",
        address: "(118.***)",
        label: "dcinside.com",
        titleHint: "개념글 댓글 반응",
        titlePrefix: "갤러리 댓글",
        actions: ["추천", "비추천", "댓글", "신고"],
      };
    case "ruliweb":
      return {
        variant: "ruliweb",
        shell: "bg-[#f8fbff] border-[#c6d7f0]",
        topBar: "bg-[#1b5fbf] border-[#11458c]",
        titleBar: "bg-[#edf4ff] border-[#d6e4f7]",
        bubble: "bg-[#ffffff] border-[#d6e4f7]",
        badge: "bg-[#0078ff] text-white",
        nickname: "루리웹유저",
        address: "",
        label: "bbs.ruliweb.com",
        titleHint: "BEST 댓글 반응",
        titlePrefix: "루리웹 댓글",
        actions: ["추천", "비추천", "댓글", "공유"],
      };
    case "clien":
      return {
        variant: "clien",
        shell: "bg-[#f7fafc] border-[#d7e0ea]",
        topBar: "bg-[#f2f6fb] border-[#d7e0ea]",
        titleBar: "bg-[#ffffff] border-[#e3e9f0]",
        bubble: "bg-[#ffffff] border-[#e3e9f0]",
        badge: "bg-[#5f7fa6] text-white",
        nickname: "클량회원",
        address: "",
        label: "clien.net",
        titleHint: "회원 의견",
        titlePrefix: "클리앙 댓글",
        actions: ["공감", "비공감", "댓글", "공유"],
      };
    case "ppomppu":
      return {
        variant: "ppomppu",
        shell: "bg-[#fffaf7] border-[#e6d0c2]",
        topBar: "bg-[#ff6f32] border-[#ff6f32]",
        titleBar: "bg-[#fff4ee] border-[#f0d7ca]",
        bubble: "bg-[#ffffff] border-[#f0d7ca]",
        badge: "bg-[#f25f2a] text-white",
        nickname: "뽐뻐",
        address: "",
        label: "ppomppu.co.kr",
        titleHint: "인기 댓글",
        titlePrefix: "뽐뿌 댓글",
        actions: ["추천", "비추천", "댓글", "공유"],
      };
    case "bobaedream":
      return {
        variant: "bobaedream",
        shell: "bg-[#f7fafc] border-[#cfd8e3]",
        topBar: "bg-[#1e3a8a] border-[#1e3a8a]",
        titleBar: "bg-[#edf3fb] border-[#d7e1f0]",
        bubble: "bg-[#ffffff] border-[#d7e1f0]",
        badge: "bg-[#1e3a8a] text-white",
        nickname: "보배회원",
        address: "",
        label: "bobaedream.co.kr",
        titleHint: "인기 댓글 반응",
        titlePrefix: "보배드림 댓글",
        actions: ["추천", "반대", "댓글", "신고"],
      };
    case "dogdrip":
      return {
        variant: "dogdrip",
        shell: "bg-[#f4f6ef] border-[#d5dac6]",
        topBar: "bg-[#6d8a2b] border-[#6d8a2b]",
        titleBar: "bg-[#eef3df] border-[#dfe4d1]",
        bubble: "bg-[#ffffff] border-[#dfe4d1]",
        badge: "bg-[#6d8a2b] text-white",
        nickname: "개드립유저",
        address: "",
        label: "dogdrip.net",
        titleHint: "개드립 댓글 반응",
        titlePrefix: "개드립 댓글",
        actions: ["추천", "비추천", "댓글", "신고"],
      };
    case "fmkorea":
      return {
        variant: "fmkorea",
        shell: "bg-[#fafbfd] border-[#cdd7e3]",
        topBar: "bg-[#0f172a] border-[#0f172a]",
        titleBar: "bg-[#eef3f8] border-[#dbe3ec]",
        bubble: "bg-[#ffffff] border-[#dbe3ec]",
        badge: "bg-[#0f172a] text-white",
        nickname: "에펨유저",
        address: "",
        label: "fmkorea.com",
        titleHint: "포텐 댓글 반응",
        titlePrefix: "에펨코리아 댓글",
        actions: ["추천", "비추천", "댓글", "공유"],
      };
    default:
      return {
        variant: "default",
        shell: "bg-[#f5f6f7] border-gray-300",
        topBar: "bg-white border-gray-300",
        titleBar: "bg-[#eef1f5] border-gray-200",
        bubble: "bg-[#fafafa] border-gray-200",
        badge: "bg-gray-700 text-white",
        nickname: "익명",
        address: "",
        label: `${source} 댓글 캡처`,
        titleHint: "상위 댓글 반응",
        titlePrefix: "댓글",
        actions: ["추천", "비추천", "답글", "공유"],
      };
  }
}

function formatFakeCommentTime(index: number) {
  return `2026.04.08 09:${String(10 + index).padStart(2, "0")}`;
}

function formatFakeCommentCount(index: number) {
  return String(12 + index * 7);
}

function formatFakeViewCount(base: number, index: number) {
  return String(Math.max(18, Math.floor(base / 11) + 18 + index * 9));
}

function formatFakeRecommendCount(base: number, index: number) {
  return String(Math.max(3, Math.floor(base / 4) + 3 + index));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}): Promise<Metadata> {
  const { source, id } = await params;
  const postId = `${source}_${id}`;
  const post = await getCuratedPostById(postId);

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
  const post = await getCuratedPostById(postId);

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
  const proxiedContent = post.custom_body_md
    ? ""
    : post.content
      ? proxyMedia(post.content)
      : "";
  const popularity = getPopularityLevel(post);
  const catName = categoryMap[post.category] || post.category;
  const displayViews = post.cached_view_count ?? post.site_view_count ?? 0;
  const publishedAt = new Date(post.crawled_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const authorName = post.curator_name || "드립지기";
  const leadImage = post.thumbnail_url || post.image_urls[0] || null;
  const commentSkin = getCommentSkin(post.source);
  const adminUser = await checkRole(["OWNER", "MANAGING_EDITOR", "EDITOR", "REVIEWER", "AD_MANAGER"]);

  return (
    <article className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white px-5 py-8 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800 sm:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", url: "https://www.dripszone.com" },
          { name: "24시간 베스트", url: "https://www.dripszone.com/best_24h" },
          { name: post.source_name, url: `https://www.dripszone.com/community/${source}/${id}` },
        ]}
      />

      <nav className="mb-5 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">홈</Link>
        <span className="mx-1">/</span>
        <Link href="/best_24h" className="hover:text-gray-700 dark:hover:text-gray-200">24시간 베스트</Link>
        <span className="mx-1">/</span>
        <span>{catName}</span>
      </nav>

      <header className="border-b border-gray-200 pb-6 dark:border-gray-700">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`${popularity.color} rounded px-2 py-0.5 text-xs font-bold`}>
            {popularity.label}
          </span>
          <span className={`${colorClass} rounded px-2 py-0.5 text-xs font-medium`}>
            {post.source_name}
          </span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {catName}
          </span>
          {adminUser && (
            <Link
              href={`/admin/inbox/${encodeURIComponent(post.id)}`}
              className="rounded bg-gray-900 px-2 py-0.5 text-xs font-bold text-white hover:bg-gray-700"
            >
              게시글 수정
            </Link>
          )}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-[2.2rem]">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
              {authorName.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{authorName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                게시일 {publishedAt}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>조회수 {displayViews.toLocaleString()}</span>
            <span>추천 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {leadImage && (
        <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <img
            src={needsProxy(leadImage) ? `/api/image?url=${encodeURIComponent(leadImage)}` : leadImage}
            referrerPolicy={needsProxy(leadImage) ? undefined : "no-referrer"}
            alt=""
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3 border-y border-gray-200 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          원문 보기
        </a>
        <LikeButton postId={post.id} />
        <ShareButton postId={post.id} />
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900/50">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Excerpt</p>
        <p className="mt-2 text-[15px] leading-7 text-gray-700 dark:text-gray-200">
          {post.summary ? cleanSummaryText(post.summary) : `${post.source_name}에서 화제가 된 게시글입니다.`}
        </p>
      </div>

      {post.custom_body_md ? (
        <div className="article-body whitespace-pre-wrap text-gray-800 dark:text-gray-100">
          {post.custom_body_md}
        </div>
      ) : proxiedContent ? (
        <div
          className="article-body post-content"
          style={{ wordBreak: "break-word" }}
          dangerouslySetInnerHTML={{ __html: proxiedContent }}
        />
      ) : null}

      {!post.custom_body_md && !post.content && post.image_urls && post.image_urls.length > 0 && (
        <div className="article-body my-6 space-y-3">
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

      {post.top_comments && post.top_comments.length > 0 && (
        <section className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">반응 포인트</h2>
          <div className="mt-4 space-y-4">
            {post.top_comments.map((comment, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-lg border ${commentSkin.shell} shadow-sm dark:border-gray-700 dark:bg-gray-900`}
              >
                {commentSkin.variant === "dcinside" && (
                  <div className={`border-b px-3 py-2 text-white ${commentSkin.topBar} dark:border-gray-700`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tracking-[0.08em]">dcinside</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
                          GALLERY
                        </span>
                        <span className="hidden text-white/70 sm:inline">{catName}</span>
                      </div>
                      <span className="text-white/80">{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "ruliweb" && (
                  <div className={`border-b px-3 py-2 text-white ${commentSkin.topBar} dark:border-gray-700`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tracking-[0.08em]">RULIWEB</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
                          BEST
                        </span>
                        <span className="hidden text-white/70 sm:inline">유머 게시판</span>
                      </div>
                      <span className="text-white/80">{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "clien" && (
                  <div className={`border-b px-3 py-2 ${commentSkin.topBar} dark:border-gray-700 dark:bg-gray-800`}>
                    <div className="flex items-center justify-between text-[11px] text-[#53708e] dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">clien</span>
                        <span className="rounded bg-[#dfe9f5] px-1.5 py-0.5 text-[10px] font-medium text-[#4f6f92] dark:bg-gray-700 dark:text-gray-300">
                          회원의견
                        </span>
                      </div>
                      <span>{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "ppomppu" && (
                  <div className={`border-b px-3 py-2 text-white ${commentSkin.topBar} dark:border-gray-700`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">PPOMPPU</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
                          HOT
                        </span>
                      </div>
                      <span className="text-white/80">{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "dogdrip" && (
                  <div className={`border-b px-3 py-2 text-white ${commentSkin.topBar} dark:border-gray-700`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">DOGDRIP</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
                          BEST
                        </span>
                        <span className="hidden text-white/70 sm:inline">개드립</span>
                      </div>
                      <span className="text-white/80">{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "bobaedream" && (
                  <div className={`border-b px-3 py-2 text-white ${commentSkin.topBar} dark:border-gray-700`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">BOBAEDREAM</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
                          BEST
                        </span>
                      </div>
                      <span className="text-white/80">{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "fmkorea" && (
                  <div className={`border-b px-3 py-2 text-white ${commentSkin.topBar} dark:border-gray-700`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">FMKOREA</span>
                        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium">
                          포텐
                        </span>
                      </div>
                      <span className="text-white/80">{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                {commentSkin.variant === "default" && (
                  <div className={`border-b px-3 py-2 ${commentSkin.topBar} dark:border-gray-700 dark:bg-gray-800`}>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                      <span>{commentSkin.label}</span>
                    </div>
                  </div>
                )}

                <div className={`border-b px-4 py-3 ${commentSkin.titleBar} dark:border-gray-700 dark:bg-gray-800/80`}>
                  {commentSkin.variant === "dcinside" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#1f2a44] dark:text-white">
                            [{catName}] {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · {commentSkin.titleHint}
                          </p>
                        </div>
                        <span className="shrink-0 rounded border border-[#d7dde6] bg-[#f5f7fb] px-2 py-1 text-[10px] font-semibold text-[#3b4890] shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-blue-300">
                          개념글
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#e5e8ee] pt-2 text-[11px] text-[#667085] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto_auto]">
                        <span className="truncate">작성자 {commentSkin.nickname}{commentSkin.address}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>조회 {formatFakeViewCount(displayViews, i)}</span>
                        <span>추천 {formatFakeRecommendCount(post.like_count, i)}</span>
                      </div>
                    </div>
                  ) : commentSkin.variant === "ruliweb" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[#214e8a] dark:text-blue-300">
                            {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · 베스트 댓글
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#1b5fbf] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          BEST
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#d8e4f3] pt-2 text-[11px] text-[#667085] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto_auto]">
                        <span className="truncate">작성자 {commentSkin.nickname}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>조회 {formatFakeViewCount(displayViews, i)}</span>
                        <span>추천 {formatFakeRecommendCount(comment.likes, i)}</span>
                      </div>
                    </div>
                  ) : commentSkin.variant === "dogdrip" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[#51671f] dark:text-lime-300">
                            {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · 개드립 반응
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#6d8a2b] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          개드립
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#dfe4d1] pt-2 text-[11px] text-[#6a7485] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto_auto]">
                        <span className="truncate">닉네임 {commentSkin.nickname}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>조회 {formatFakeViewCount(displayViews, i)}</span>
                        <span>추천 {formatFakeRecommendCount(comment.likes, i)}</span>
                      </div>
                    </div>
                  ) : commentSkin.variant === "clien" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#315b84] dark:text-blue-300">
                            {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · 회원의견 #{i + 1}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#5f7fa6] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          의견
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#e3e9f0] pt-2 text-[11px] text-[#667085] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto]">
                        <span className="truncate">작성자 {commentSkin.nickname}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>열람 {formatFakeViewCount(displayViews, i)}</span>
                      </div>
                    </div>
                  ) : commentSkin.variant === "ppomppu" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#e95d29] dark:text-orange-300">
                            [{post.source_name}] {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · 인기 댓글 #{i + 1}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#f25f2a] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          HOT
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#f0d7ca] pt-2 text-[11px] text-[#7b6b60] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto]">
                        <span className="truncate">닉네임 {commentSkin.nickname}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>조회 {formatFakeViewCount(displayViews, i)}</span>
                      </div>
                    </div>
                  ) : commentSkin.variant === "bobaedream" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#1f3b88] dark:text-blue-300">
                            [베스트] {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · 인기 반응 #{i + 1}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#1e3a8a] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          BEST
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#d7e1f0] pt-2 text-[11px] text-[#667085] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto]">
                        <span className="truncate">닉네임 {commentSkin.nickname}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>조회 {formatFakeViewCount(displayViews, i)}</span>
                      </div>
                    </div>
                  ) : commentSkin.variant === "fmkorea" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#111827] dark:text-gray-100">
                            [포텐] {post.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6b7280] dark:text-gray-400">
                            {commentSkin.titlePrefix} · 반응 모음 #{i + 1}
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-[#111827] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          포텐
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-[#dbe3ec] pt-2 text-[11px] text-[#667085] dark:border-gray-700 dark:text-gray-400 sm:grid-cols-[1fr_auto_auto]">
                        <span className="truncate">닉네임 {commentSkin.nickname}</span>
                        <span>{formatFakeCommentTime(i)}</span>
                        <span>조회 {formatFakeViewCount(displayViews, i)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-gray-900 dark:text-white">
                          {post.title}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {commentSkin.titlePrefix} · {commentSkin.titleHint} #{i + 1}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-medium shadow-sm ${commentSkin.badge}`}>
                        #{i + 1}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white px-4 py-4 dark:bg-gray-900">
                  {commentSkin.variant === "dcinside" && (
                    <>
                      <div className="flex items-center gap-2 border-b border-dotted border-[#d7dde5] pb-2 text-[12px]">
                        <span className="font-semibold text-[#29367c] dark:text-blue-300">{commentSkin.nickname}</span>
                        {commentSkin.address ? <span className="text-[#7d8593]">{commentSkin.address}</span> : null}
                        <span className="text-[#7d8593]">{formatFakeCommentTime(i)}</span>
                        <span className="rounded bg-[#eef2f7] px-1.5 py-0.5 text-[10px] text-[#3b4890] dark:bg-gray-800 dark:text-blue-300">실베</span>
                      </div>
                      <div className="mt-3 rounded border border-[#dfe5ee] bg-[#f8fafc] p-2 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className={`rounded border px-4 py-4 ${commentSkin.bubble} shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-gray-700 dark:bg-gray-800/70`}>
                          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                            {cleanCommentText(comment.text)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-[12px] text-[#6a7485] dark:text-gray-400">
                        <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                        <span className="text-[#c7cdd6]">|</span>
                        <span>{commentSkin.actions[1]} 0</span>
                        <span className="text-[#c7cdd6]">|</span>
                        <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                        <span className="text-[#c7cdd6]">|</span>
                        <span>{commentSkin.actions[3]}</span>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "ruliweb" && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#d8e4f3] pb-2 text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b5fbf] text-[10px] font-bold text-white">
                            R
                          </span>
                          <span className="font-semibold text-[#0078ff] dark:text-blue-300">{commentSkin.nickname}</span>
                          <span className="rounded bg-[#e9f2ff] px-1.5 py-0.5 text-[10px] font-medium text-[#0078ff] dark:bg-blue-950 dark:text-blue-300">
                            MEMBER
                          </span>
                          <span className="rounded bg-[#fff3d6] px-1.5 py-0.5 text-[10px] font-medium text-[#8a6a00] dark:bg-yellow-950 dark:text-yellow-300">
                            BEST
                          </span>
                        </div>
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                      </div>
                      <div className="mt-3 rounded-md border border-[#d8e4f3] bg-[#f7fbff] p-2 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className={`rounded-md border px-4 py-4 ${commentSkin.bubble} shadow-sm dark:border-gray-700 dark:bg-gray-800/70`}>
                          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                            {cleanCommentText(comment.text)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#d8e4f3] pt-2 text-[12px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                          <span>{commentSkin.actions[1]} 0</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                          <span>스크랩</span>
                        </div>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "clien" && (
                    <>
                      <div className="flex items-center gap-2 border-b border-dashed border-gray-200 pb-2 text-[12px] dark:border-gray-700">
                        <span className="font-semibold text-[#2f5d8a] dark:text-blue-300">{commentSkin.nickname}</span>
                        <span className="rounded bg-[#eef4fa] px-1.5 py-0.5 text-[10px] text-[#2f5d8a] dark:bg-gray-800 dark:text-blue-300">회원의견</span>
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                      </div>
                      <div className="py-4">
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                          {cleanCommentText(comment.text)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 border-t border-dashed border-gray-200 pt-2 text-[12px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                        <span>{commentSkin.actions[1]} 0</span>
                        <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                        <span>{commentSkin.actions[3]}</span>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "ppomppu" && (
                    <>
                      <div className="flex items-center gap-2 border-b border-[#f0d7ca] pb-2 text-[12px]">
                        <span className="font-semibold text-[#f25f2a] dark:text-orange-300">{commentSkin.nickname}</span>
                        <span className="text-gray-400">[{post.source_name}]</span>
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                        <span className="rounded bg-[#fff1e8] px-1.5 py-0.5 text-[10px] text-[#f25f2a] dark:bg-gray-800 dark:text-orange-300">HOT</span>
                      </div>
                      <div className={`mt-3 border-l-4 border-[#f25f2a] px-4 py-3 ${commentSkin.bubble} shadow-sm dark:border-orange-400 dark:bg-gray-800/70`}>
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                          {cleanCommentText(comment.text)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-4 border-t border-[#f0d7ca] pt-2 text-[12px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                        <span>{commentSkin.actions[1]} 0</span>
                        <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                        <span>{commentSkin.actions[3]}</span>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "dogdrip" && (
                    <>
                      <div className="flex items-center gap-2 border-b border-[#dfe4d1] pb-2 text-[12px]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#6d8a2b] text-[10px] font-bold text-white">
                          개
                        </span>
                        <span className="font-semibold text-[#627a2a] dark:text-lime-300">{commentSkin.nickname}</span>
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                        <span className="rounded bg-[#eef1e0] px-1.5 py-0.5 text-[10px] text-[#627a2a] dark:bg-gray-800 dark:text-lime-300">BEST</span>
                      </div>
                      <div className="mt-3 rounded-md border border-[#e4e9d8] bg-[#f7f9f1] p-2 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className={`rounded-md border px-4 py-4 ${commentSkin.bubble} shadow-sm dark:border-gray-700 dark:bg-gray-800/70`}>
                          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                            {cleanCommentText(comment.text)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 border-t border-[#dfe4d1] pt-2 text-[12px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <span className="rounded bg-[#edf2e2] px-2 py-0.5 text-[#5d7328] dark:bg-gray-800 dark:text-lime-300">
                          {commentSkin.actions[0]} {comment.likes.toLocaleString()}
                        </span>
                        <span>{commentSkin.actions[1]} 0</span>
                        <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                        <span>스크랩</span>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "bobaedream" && (
                    <>
                      <div className="flex items-center gap-2 border-b border-[#d7e1f0] pb-2 text-[12px]">
                        <span className="font-semibold text-[#1e3a8a] dark:text-blue-300">{commentSkin.nickname}</span>
                        <span className="rounded bg-[#e8eef9] px-1.5 py-0.5 text-[10px] text-[#1e3a8a] dark:bg-gray-800 dark:text-blue-300">BEST</span>
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                      </div>
                      <div className={`mt-3 rounded-md border px-4 py-4 ${commentSkin.bubble} shadow-sm dark:border-gray-700 dark:bg-gray-800/70`}>
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                          {cleanCommentText(comment.text)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-4 border-t border-[#d7e1f0] pt-2 text-[12px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                        <span>{commentSkin.actions[1]} 0</span>
                        <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                        <span>{commentSkin.actions[3]}</span>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "fmkorea" && (
                    <>
                      <div className="flex items-center justify-between border-b border-[#dbe3ec] pb-2 text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0f172a] dark:text-gray-100">{commentSkin.nickname}</span>
                          <span className="rounded bg-[#e5ecf5] px-1.5 py-0.5 text-[10px] text-[#0f172a] dark:bg-gray-800 dark:text-gray-200">포텐</span>
                        </div>
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                      </div>
                      <div className={`mt-3 rounded-md border px-4 py-4 ${commentSkin.bubble} shadow-sm dark:border-gray-700 dark:bg-gray-800/70`}>
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                          {cleanCommentText(comment.text)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[#dbe3ec] pt-2 text-[12px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                          <span>{commentSkin.actions[1]} 0</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                          <span>{commentSkin.actions[3]}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {commentSkin.variant === "default" && (
                    <>
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="font-semibold text-[#3366cc] dark:text-blue-300">{commentSkin.nickname}</span>
                        {commentSkin.address ? <span className="text-gray-400">{commentSkin.address}</span> : null}
                        <span className="text-gray-400">{formatFakeCommentTime(i)}</span>
                      </div>
                      <div className={`mt-3 rounded border px-4 py-4 ${commentSkin.bubble} dark:border-gray-700 dark:bg-gray-800/70`}>
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-900 dark:text-gray-100">
                          {cleanCommentText(comment.text)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-[12px] text-gray-500 dark:text-gray-400">
                        <span>{commentSkin.actions[0]} {comment.likes.toLocaleString()}</span>
                        <span>{commentSkin.actions[1]} 0</span>
                        <span>{commentSkin.actions[2]} {formatFakeCommentCount(i)}</span>
                        <span>{commentSkin.actions[3]}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
        <p>
          <span className="font-semibold text-gray-900 dark:text-white">출처</span> {post.source_name} ({new URL(post.url).hostname})
        </p>
        <p className="mt-1">
          <span className="font-semibold text-gray-900 dark:text-white">수집일</span> {publishedAt}
        </p>
        <p className="mt-3 leading-7">
          이 페이지는 커뮤니티 원문을 바탕으로 정리된 게시글입니다. 원문 저작권은 원저작자와 원출처에 있으며,
          자세한 내용은 <Link href="/copyright" className="text-blue-600 hover:text-blue-700">저작권 안내</Link>를 참고하세요.
        </p>
      </section>

      <div className="mt-8">
        <CommentSection postId={post.id} />
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-700">
        <Link href="/best_24h" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          &larr; 24시간 베스트로
        </Link>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          원본 사이트에서 보기
        </a>
      </div>

      <RelatedPosts currentId={post.id} category={post.category} />
    </article>
  );
}

function RelatedPosts({ currentId, category }: { currentId: string; category: string }) {
  const related = getRelatedPosts(currentId, category, 6);
  if (related.length === 0) return null;

  return (
    <section className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">관련 게시글</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {related.map((p) => {
          const color = sourceColors[p.source] || "bg-gray-100 text-gray-700";
          const url = getCommunityUrl(p);
          return (
            <Link
              key={p.id}
              href={url}
              className="flex gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
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
                <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">{p.title}</p>
                <span className={`${color} mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium`}>
                  {p.source_name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
