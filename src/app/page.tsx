import Link from "next/link";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import { prisma } from "@/lib/prisma";
import {
  getCommunityUrl,
  getMixedRecentPosts,
  getSafePosts,
  getTopPostsByCategory,
  getTrendingKeywords,
  sourceColors,
} from "@/lib/posts";
import type { Post } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Dripszone - 커뮤니티 화제를 빠르게 정리하고 추천까지 연결하는 미디어",
  description:
    "지금 뜨는 이슈를 빠르게 정리하고, 바로 써먹는 추천과 가이드를 함께 제공합니다.",
};

const PROXY_DOMAINS = ["dcinside.co.kr", "dcinside.com"];

const CATEGORY_HUB = [
  { name: "유머", href: "/humor", desc: "가볍게 보기" },
  { name: "정보/꿀팁", href: "/info", desc: "바로 써먹기" },
  { name: "이슈 해설", href: "/issue", desc: "맥락 이해하기" },
  { name: "가성비/추천", href: "/guide", desc: "돈 아끼기" },
  { name: "오늘의 정리", href: "/today", desc: "빠르게 따라잡기" },
];

const GUIDE_TYPE_LABELS: Record<string, string> = {
  GUIDE: "추천 가이드",
  COMPARISON: "비교 분석",
  TREND_ROUNDUP: "트렌드",
};

function getThumbnailSrc(url: string) {
  try {
    const hostname = new URL(url).hostname;
    if (PROXY_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      return { src: `/api/image?url=${encodeURIComponent(url)}` };
    }
  } catch {}
  return { src: url, referrerPolicy: "no-referrer" as const };
}

function HeroCard({ post }: { post: Post }) {
  const url = getCommunityUrl(post);
  const color = sourceColors[post.source] || "bg-gray-100 text-gray-700";

  return (
    <Link href={url} className="block group">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {post.thumbnail_url && (
          <div className="relative h-56 overflow-hidden sm:h-72">
            <img
              {...getThumbnailSrc(post.thumbnail_url)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className={`${color} rounded-full px-2.5 py-1 text-xs font-semibold`}>
                {post.source_name}
              </span>
              <h2 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
                {post.title}
              </h2>
            </div>
          </div>
        )}
        <div className="p-5">
          {post.summary && (
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{post.summary}</p>
          )}
          <div className="mt-3 flex gap-3 text-xs text-gray-400 dark:text-gray-500">
            {post.view_count > 0 && <span>조회 {post.view_count.toLocaleString()}</span>}
            <span>추천 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SmallCard({ post }: { post: Post }) {
  const color = sourceColors[post.source] || "bg-gray-100 text-gray-700";

  return (
    <Link href={getCommunityUrl(post)} className="block group">
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        {post.thumbnail_url && (
          <div className="h-32 overflow-hidden">
            <img
              {...getThumbnailSrc(post.thumbnail_url)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <span className={`${color} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
            {post.source_name}
          </span>
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
            {post.title}
          </h3>
          <div className="mt-2 flex gap-2 text-[10px] text-gray-400 dark:text-gray-500">
            <span>추천 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeedItem({ post }: { post: Post }) {
  const color = sourceColors[post.source] || "bg-gray-100 text-gray-700";

  return (
    <Link href={getCommunityUrl(post)} className="block">
      <div className="border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{post.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`${color} rounded-full px-1.5 py-0.5 text-[10px] font-semibold`}>
            {post.source_name}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            추천 {post.like_count.toLocaleString()} / 댓글 {post.comment_count.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

type GuidePreview = {
  slug: string;
  title: string;
  summary: string | null;
  articleType: string;
  project: { name: string } | null;
};

function GuideCard({ article }: { article: GuidePreview }) {
  return (
    <Link
      href={`/guide/${article.slug}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        지금 많이 클릭하는 추천
      </span>
      <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">{article.title}</h3>
      {article.summary && (
        <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{article.summary}</p>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>{GUIDE_TYPE_LABELS[article.articleType] || article.articleType}</span>
        {article.project && <span>{article.project.name}</span>}
      </div>
    </Link>
  );
}

function EmptyGuideCard() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-800/60">
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
        추천형 콘텐츠 준비 중
      </span>
      <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
        구매 의도가 높은 추천형 콘텐츠를 곧 채웁니다
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        가성비 생활템, 디지털 액세서리, 자취용품 정리 같은 실전형 가이드를 우선 발행할 예정입니다.
      </p>
      <Link
        href="/guide"
        className="mt-4 inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        가이드 허브 보기
      </Link>
    </div>
  );
}

export default async function Home() {
  const infoPicks = getSafePosts(getTopPostsByCategory("info", 8)).slice(0, 4);
  const issuePicks = getSafePosts(getTopPostsByCategory("issue", 6)).slice(0, 3);
  const humorPicks = getSafePosts(getTopPostsByCategory("humor", 10)).slice(0, 4);
  const heroPost = infoPicks[0] || issuePicks[0] || humorPicks[0];
  const usedIds = new Set([
    heroPost?.id,
    ...infoPicks.map((p) => p.id),
    ...issuePicks.map((p) => p.id),
    ...humorPicks.map((p) => p.id),
  ]);
  const recentFeed = getSafePosts(getMixedRecentPosts(30))
    .filter((p) => !usedIds.has(p.id))
    .slice(0, 10);
  const trendingKeywords = getTrendingKeywords(8);

  let guidePicks: GuidePreview[] = [];
  try {
    guidePicks = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        articleType: { in: ["GUIDE", "COMPARISON", "TREND_ROUNDUP"] },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        summary: true,
        articleType: true,
        project: { select: { name: true } },
      },
    });
  } catch {
    guidePicks = [];
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8_55%,#bfdbfe)] p-7 text-white shadow-sm">
          <p className="text-sm font-medium text-blue-200">화제를 빠르게 보고, 바로 써먹는 정보까지</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            커뮤니티 화제를 가장 빠르게 정리하고, 진짜 쓸모 있는 정보까지 남깁니다
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
            지금 뜨는 이슈를 한 번에 따라잡고, 생활에 바로 쓰는 추천과 비교까지 이어서 볼 수 있게 구성했습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/live"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              지금 뜨는 이슈 보기
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              가성비 추천 바로 보기
            </Link>
          </div>
          {trendingKeywords.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {trendingKeywords.map((keyword) => (
                <Link
                  key={keyword}
                  href={`/search?q=${encodeURIComponent(keyword)}`}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/90 transition-colors hover:bg-white/10"
                >
                  #{keyword}
                </Link>
              ))}
            </div>
          )}
        </div>
        {heroPost && <HeroCard post={heroPost} />}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">지금 많이 클릭하는 추천</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              구매 의도가 높은 추천형 콘텐츠를 상단에서 바로 연결합니다.
            </p>
          </div>
          <Link href="/guide" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            전체 가이드 보기
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {guidePicks.length > 0
            ? guidePicks.map((article) => <GuideCard key={article.slug} article={article} />)
            : Array.from({ length: 3 }).map((_, index) => <EmptyGuideCard key={index} />)}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">지금 뜨는 콘텐츠</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            실시간 화제와 오늘의 요약, 이슈 해설을 빠르게 훑을 수 있게 묶었습니다.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">실시간 화제</h3>
                <Link href="/live" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                  전체보기
                </Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {recentFeed.map((post) => (
                  <FeedItem key={post.id} post={post} />
                ))}
              </div>
            </div>
            <AdBanner type="adsense" />
          </div>
          <div className="space-y-4">
            {issuePicks.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">이슈 해설</h3>
                  <Link href="/issue" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                    더보기
                  </Link>
                </div>
                <div className="grid gap-3">
                  {issuePicks.slice(0, 2).map((post) => (
                    <SmallCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
            {infoPicks.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">오늘의 정리</h3>
                  <Link href="/today" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                    더보기
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {infoPicks.slice(0, 2).map((post) => (
                    <SmallCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">카테고리 허브</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CATEGORY_HUB.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-200 px-4 py-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100">Dripszone 운영 원칙</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "매일 업데이트",
              "핵심만 요약",
              "직접 비교해서 추천",
              "재정리 중심 운영",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/80 px-4 py-4 text-sm font-medium text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-blue-900 dark:text-blue-100">
            Dripszone의 추천 콘텐츠에는 제휴 링크가 포함될 수 있으며, 독자에게 도움이 되는 기준으로만 선별합니다.
            화제성만 모으지 않고 실제로 도움이 되는 정보까지 함께 정리합니다.
          </p>
        </div>
      </section>

      {humorPicks.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">가볍게 보기 좋은 유머 Picks</h2>
            <Link href="/humor" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              유머 더보기
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {humorPicks.map((post) => (
              <SmallCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <AdBanner type="coupang" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">브랜드 제휴, 네이티브 콘텐츠, 배너 광고 문의</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Dripszone와 협업하고 싶다면 광고/제휴 안내 페이지에서 진행 방식과 문의 경로를 확인할 수 있습니다.
            </p>
          </div>
          <Link
            href="/advertise"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            광고/제휴 안내 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
