import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "가성비/추천 가이드 - Dripszone",
  description: "커뮤니티에서 반응 좋은 제품과 서비스를 비교하고 추천합니다. 가성비 좋은 선택을 도와드립니다.",
  robots: { index: true, follow: true },
};

export default function GuidePage() {
  const upcomingTopics = [
    { title: "자취생 필수템 추천", desc: "커뮤니티에서 반응 좋은 자취 아이템을 정리합니다." },
    { title: "사무용 의자 가성비 비교", desc: "가격대별 사무용 의자를 비교 분석합니다." },
    { title: "무선 이어폰 입문용 추천", desc: "10만 원 이하 무선 이어폰을 비교합니다." },
    { title: "반려동물 자동급식기 비교", desc: "강아지/고양이 자동급식기 추천 가이드입니다." },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">가성비/추천 가이드</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          커뮤니티에서 반응 좋은 제품과 서비스를 비교하고, 가성비 좋은 선택을 돕습니다.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">준비 중입니다</h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Dripszone 에디터가 직접 조사하고 비교한 추천 가이드를 곧 만나보실 수 있습니다.
          커뮤니티에서 실제로 반응 좋은 제품과 서비스를 선별하여 정리할 예정입니다.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">예정된 가이드</h2>
        {upcomingTopics.map((topic, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{topic.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{topic.desc}</p>
            <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
              준비 중
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; 홈으로 돌아가기
        </Link>
      </div>
    </>
  );
}
