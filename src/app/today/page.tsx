import { getTopPostsByPopularity, getSafePosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "오늘의 정리 - 오늘 뜨는 화제를 한입에 | Dripszone",
  description: "오늘 커뮤니티에서 가장 화제가 된 이슈를 빠르게 정리합니다. 핵심만 짧게 읽어보세요.",
  robots: { index: true, follow: true },
};

export default function TodayPage() {
  const topPosts = getSafePosts(getTopPostsByPopularity(20)).slice(0, 10);
  const lead = topPosts[0];

  return (
    <>
      <section className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">오늘의 정리</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          오늘 많이 본 글을 빠르게 훑을 수 있게 정리했습니다.
        </p>
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">한 줄 요약</p>
          <p className="mt-2 text-sm leading-relaxed text-blue-900 dark:text-blue-100">
            {lead
              ? `지금 가장 반응이 큰 글은 "${lead.title}"입니다. 아래 목록에서 오늘 많이 본 글을 순서대로 확인할 수 있습니다.`
              : "수집된 글이 아직 없어 오늘의 정리를 만들지 못했습니다."}
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/live"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            실시간 화제 보기
          </Link>
          <Link
            href="/info"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            정보/꿀팁으로 이어서 보기
          </Link>
        </div>
      </section>

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
