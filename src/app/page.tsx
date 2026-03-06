import {
  getTopPostsByCategory,
  getRecentPosts,
  getTrendingKeywords,
  getCommunityUrl,
  sourceColors,
} from "@/lib/posts";
import type { Post } from "@/lib/posts";
import AdBanner from "@/components/AdBanner";
import Link from "next/link";

const PROXY_DOMAINS = ["dcinside.co.kr", "dcinside.com"];

function getThumbnailSrc(url: string) {
  try {
    const hostname = new URL(url).hostname;
    if (PROXY_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d))) {
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
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        {post.thumbnail_url && (
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img
              {...getThumbnailSrc(post.thumbnail_url)}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className={`${color} px-2 py-0.5 rounded text-xs font-medium`}>
                {post.source_name}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-2 line-clamp-2">
                {post.title}
              </h2>
            </div>
          </div>
        )}
        {!post.thumbnail_url && (
          <div className="p-4">
            <span className={`${color} px-2 py-0.5 rounded text-xs font-medium`}>
              {post.source_name}
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2 line-clamp-2">
              {post.title}
            </h2>
          </div>
        )}
        <div className="px-4 py-3">
          {post.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
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

function SmallCard({ post }: { post: Post }) {
  const url = getCommunityUrl(post);
  const color = sourceColors[post.source] || "bg-gray-100 text-gray-700";

  return (
    <Link href={url} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow h-full">
        {post.thumbnail_url && (
          <div className="h-32 overflow-hidden">
            <img
              {...getThumbnailSrc(post.thumbnail_url)}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`${color} px-1.5 py-0.5 rounded text-[10px] font-medium`}>
              {post.source_name}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {post.title}
          </h3>
          <div className="flex gap-2 text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
            <span>추천 {post.like_count.toLocaleString()}</span>
            <span>댓글 {post.comment_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeedItem({ post }: { post: Post }) {
  const url = getCommunityUrl(post);
  const color = sourceColors[post.source] || "bg-gray-100 text-gray-700";

  return (
    <Link href={url} className="block">
      <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`${color} px-1.5 py-0.5 rounded text-[10px] font-medium`}>
              {post.source_name}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              추천 {post.like_count.toLocaleString()} / 댓글 {post.comment_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const heroPost = getTopPostsByCategory("humor", 1)[0] || getRecentPosts(1)[0];
  const humorPicks = getTopPostsByCategory("humor", 5).filter((p) => p.id !== heroPost?.id).slice(0, 4);
  const infoPicks = getTopPostsByCategory("info", 4);
  const issuePicks = getTopPostsByCategory("issue", 3);
  const recentFeed = getRecentPosts(10);
  const trendingKeywords = getTrendingKeywords(8);

  return (
    <>
      {/* Hero: 오늘의 핵심 */}
      {heroPost && (
        <section className="mb-6">
          <HeroCard post={heroPost} />
        </section>
      )}

      {/* 화제 키워드 */}
      {trendingKeywords.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">지금 뜨는 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {trendingKeywords.map((keyword) => (
              <Link
                key={keyword}
                href={`/search?q=${encodeURIComponent(keyword)}`}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdBanner type="adsense" />

      {/* 유머 Picks */}
      {humorPicks.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">유머 Picks</h2>
            <Link href="/humor" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              더보기 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {humorPicks.map((post) => (
              <SmallCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* 정보/꿀팁 */}
      {infoPicks.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">정보/꿀팁</h2>
            <Link href="/info" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              더보기 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {infoPicks.map((post) => (
              <SmallCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* 이슈 해설 */}
      {issuePicks.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">이슈 해설</h2>
            <Link href="/issue" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              더보기 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {issuePicks.map((post) => (
              <SmallCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* 가성비/추천 준비 중 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">가성비/추천</h2>
          <Link href="/guide" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            더보기 &rarr;
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            커뮤니티에서 반응 좋은 추천 가이드를 준비 중입니다.
          </p>
        </div>
      </section>

      <AdBanner type="coupang" />

      {/* 실시간 피드 미리보기 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">실시간 커뮤니티</h2>
          <Link href="/live" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            전체보기 &rarr;
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          {recentFeed.map((post) => (
            <FeedItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
