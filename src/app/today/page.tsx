import { getRecentPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의 정리 - 오늘 뜨는 화제를 한입에 | Dripszone",
  description: "오늘 커뮤니티에서 가장 화제가 된 이슈를 빠르게 정리합니다. 핵심만 짧게 읽어보세요.",
  robots: { index: true, follow: true },
};

export default function TodayPage() {
  const recentPosts = getRecentPosts(10);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">오늘의 정리</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          오늘 커뮤니티에서 가장 화제가 된 이슈를 에디터가 직접 정리합니다.
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">에디터 정리 기사 준비 중</h2>
        <p className="text-sm text-green-700 dark:text-green-300">
          Dripszone 에디터가 직접 작성하는 &ldquo;오늘의 한입정리&rdquo; 기사가 곧 시작됩니다.
          왜 화제인지, 어떤 맥락인지, 알아야 할 포인트를 짧게 정리해드릴 예정입니다.
        </p>
      </div>

      <AdBanner type="adsense" />

      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">지금 뜨고 있는 글</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">최신 수집 게시물입니다.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {recentPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
