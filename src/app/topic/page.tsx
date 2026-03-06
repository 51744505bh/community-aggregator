import { getTrendingKeywords } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "토픽 허브 - 화제 키워드 모음 | Dripszone",
  description: "커뮤니티에서 자주 등장하는 화제 키워드를 모아 관련 정보를 정리합니다.",
  robots: { index: true, follow: true },
};

export default function TopicPage() {
  const keywords = getTrendingKeywords(20);

  const plannedTopics = [
    { name: "자취", desc: "자취 생활 꿀팁과 추천 아이템" },
    { name: "직장생활", desc: "직장인 공감과 직장 꿀팁" },
    { name: "반려동물", desc: "강아지/고양이 키우기 정보" },
    { name: "게임", desc: "게임 이슈와 추천" },
    { name: "IT/기기", desc: "IT 기기 리뷰와 추천" },
    { name: "음식/맛집", desc: "맛집 추천과 요리 꿀팁" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">토픽 허브</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          커뮤니티에서 자주 등장하는 주제를 모아 관련 글을 정리합니다.
        </p>
      </div>

      {/* 실시간 트렌딩 키워드 */}
      {keywords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">지금 뜨는 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <Link
                key={keyword}
                href={`/search?q=${encodeURIComponent(keyword)}`}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 기획 토픽 */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">기획 토픽</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plannedTopics.map((topic) => (
            <div key={topic.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{topic.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{topic.desc}</p>
              <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
                준비 중
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
