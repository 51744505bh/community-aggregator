import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Dripszone",
  description: "Dripszone는 커뮤니티에서 뜨는 화제를 빠르게 정리하고, 유용한 정보를 함께 제공하는 유머/정보 미디어입니다.",
};

export default function AboutPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About Dripszone</h1>
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">

        <section>
          <p className="text-base leading-relaxed">
            <strong className="text-gray-900 dark:text-white">Dripszone</strong>는
            커뮤니티와 실생활 현장에서 뜨는 화제를 빠르게 정리하고, 웃을 거리와 유용한 정보를
            함께 제공하는 <strong className="text-gray-900 dark:text-white">유머/정보 미디어</strong>입니다.
          </p>
          <p className="text-base leading-relaxed">
            단순한 링크 모음이 아니라, 화제의 배경과 핵심 요약, 맥락 설명, 관련 정보와
            추천 가이드를 통해 독자가 시간을 아끼고 더 정확하게 이해하도록 돕습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dripszone의 약속</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">빠르게 본다</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">지금 뜨는 것을 놓치지 않게</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">짧게 이해한다</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">왜 화제인지 바로 알게</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">쓸모 있게 남긴다</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">웃고 끝나는 게 아니라 정보로 남게</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">안전하게 운영한다</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">과도한 자극보다 읽을 가치 있는 방향으로</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">무엇을 제공하나요?</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>오늘의 정리</strong> - 오늘 뜨는 화제를 핵심만 정리</li>
            <li><strong>이슈 해설</strong> - 이슈의 배경과 맥락을 설명</li>
            <li><strong>유머</strong> - 커뮤니티에서 반응 좋은 웃긴 글 모음</li>
            <li><strong>정보/꿀팁</strong> - 실생활에 유용한 정보 정리</li>
            <li><strong>가성비/추천</strong> - 커뮤니티 반응 기반 추천 가이드</li>
            <li><strong>실시간 트렌드</strong> - 주요 커뮤니티의 실시간 화제</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">참고 커뮤니티</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            아래 커뮤니티의 인기 게시물을 참고하여 정리합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {["에펨코리아", "디시인사이드", "루리웹", "보배드림", "도그드립", "클리앙", "뽐뿌"].map((name) => (
              <span key={name} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                {name}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">문의</h2>
          <p>
            서비스 관련 문의, 광고/제휴, 저작권 관련 요청은{" "}
            <a href="mailto:51744505bh@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              51744505bh@gmail.com
            </a>
            으로 연락해주세요.
          </p>
        </section>
      </div>
    </article>
  );
}
