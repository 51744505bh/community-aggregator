import Link from "next/link";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import {
  getCommunityUrl,
  sourceColors,
} from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { getCuratedFeed } from "@/lib/curation";

export const metadata: Metadata = {
  title: "Dripszone - 커뮤니티 베스트 피드",
  description: "24시간, 주간, 월간 기준으로 국내 커뮤니티 베스트 글을 빠르게 모아보는 피드 허브입니다.",
};

function FeedListItem({ post }: { post: Post }) {
  const color = sourceColors[post.source] || "bg-gray-100 text-gray-700";
  const displayViews = post.cached_view_count ?? post.site_view_count ?? 0;
  const authorName = post.curator_name || "드립지기";

  return (
    <li className="border-b border-gray-100 last:border-b-0 dark:border-gray-700">
      <Link
        href={getCommunityUrl(post)}
        className="block px-4 py-3 transition-colors hover:bg-gray-50"
      >
        <p className="line-clamp-2 text-[16px] font-bold leading-6 text-gray-900">{post.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span className={`${color} rounded px-1.5 py-0.5 font-semibold`}>{post.source_name}</span>
          <span className="font-medium text-gray-600">{authorName}</span>
          <span>|</span>
          <span>조회수 {displayViews.toLocaleString()}</span>
          <span>추천 {post.like_count.toLocaleString()}</span>
          <span>댓글 {post.comment_count.toLocaleString()}</span>
        </div>
      </Link>
    </li>
  );
}

function FeedSection({
  title,
  href,
  moreLabel,
  posts,
}: {
  title: string;
  href: string;
  moreLabel: string;
  posts: Post[];
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between border-b border-gray-300 pb-2">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <Link href={href} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          {moreLabel} +
        </Link>
      </div>
      <div className="overflow-hidden border border-gray-200 bg-white">
        {posts.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            아직 수집된 게시글이 없습니다.
          </div>
        ) : (
          <ul>
            {posts.map((post) => (
              <FeedListItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [dailyPosts, weeklyPosts, monthlyPosts] = await Promise.all([
    getCuratedFeed("BEST_24H", 15),
    getCuratedFeed("BEST_WEEKLY", 10),
    getCuratedFeed("BEST_MONTHLY", 10),
  ]);

  return (
    <div className="space-y-10">
      <section className="border-b border-gray-200 pb-5">
        <h1 className="text-[30px] font-extrabold tracking-tight text-gray-900">
          커뮤니티 피드 베스트
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          24시간, 주간, 월간 기준으로 많이 본 게시글만 정리했습니다.
        </p>
      </section>

      <AdBanner />

      <FeedSection
        title="24시간 베스트 피드"
        href="/best_24h"
        moreLabel="24시간 더보기"
        posts={dailyPosts}
      />

      <FeedSection
        title="주간 베스트 피드"
        href="/best_weekly"
        moreLabel="주간 더보기"
        posts={weeklyPosts}
      />

      <AdBanner type="coupang" />

      <FeedSection
        title="월간 베스트 피드"
        href="/best_monthly"
        moreLabel="월간 더보기"
        posts={monthlyPosts}
      />
    </div>
  );
}
