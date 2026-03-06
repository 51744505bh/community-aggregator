import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "광고/제휴 안내 - Dripszone",
  description: "Dripszone 광고 및 제휴 문의 안내입니다. 디스플레이 배너, 네이티브 추천, 브랜드 정리 기사 등의 광고 상품을 제공합니다.",
};

export default function AdvertisePage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">광고/제휴 안내</h1>
      <div className="text-gray-700 dark:text-gray-300 space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dripszone 소개</h2>
          <p>
            Dripszone는 국내 주요 커뮤니티의 화제를 빠르게 정리하는 유머/정보 미디어입니다.
            20~40대 남녀를 중심으로 실시간 트렌드, 유머, 생활 정보, 추천 가이드 콘텐츠를 제공합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">광고 상품</h2>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">A. 디스플레이 기본 패키지</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>홈 하단 배너</li>
                <li>기사 하단 배너</li>
                <li>모바일 중단 배너</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">B. 네이티브 추천 패키지</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>오늘의 추천템 슬롯</li>
                <li>기사 하단 추천 콘텐츠</li>
                <li>토픽 허브 추천 모듈</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">C. 브랜드 정리 기사</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>&ldquo;이 제품/서비스가 화제인 이유&rdquo; 형식의 정리 기사</li>
                <li>리뷰/비교형 콘텐츠 (경험 기반)</li>
                <li>스폰서 콘텐츠 라벨 명확 표기</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">광고 원칙</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>광고/협찬 콘텐츠는 반드시 라벨을 표시합니다.</li>
            <li>독자의 읽기 경험을 방해하지 않는 배치를 원칙으로 합니다.</li>
            <li>광고가 편집 콘텐츠로 오인되지 않도록 구분합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">문의</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200">
              광고 및 제휴 문의는 아래 이메일로 연락해주세요.
            </p>
            <p className="text-blue-700 dark:text-blue-300 font-medium mt-2">
              <a href="mailto:51744505bh@gmail.com" className="hover:underline">51744505bh@gmail.com</a>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              문의 시 광고 유형, 기간, 예산 범위를 포함해주시면 빠른 답변이 가능합니다.
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
