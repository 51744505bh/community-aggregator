import { getTopPostsByPopularity, getSafePosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 정리 - 오늘 뜨는 화제를 한입에 | Dripszone",
  description: "오늘 커뮤니티에서 가장 화제가 된 이슈를 빠르게 정리합니다. 핵심만 짧게 읽어보세요.",
  robots: { index: true, follow: true },
};

export default function TodayPage() {
  const topPosts = getSafePosts(getTopPostsByPopularity(20)).slice(0, 10);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">오늘의 정리</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          커뮤니티에서 가장 반응이 뜨거운 게시물을 모았습니다.
        </p>
      </div>

      <AdBanner type="adsense" />

      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">인기 급상승</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">조회수, 추천수, 댓글수 종합 인기순입니다.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {topPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
