export default function AboutPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About</h1>
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4">
        <p>
          <strong>커뮤니티 인기글</strong>은 국내 주요 온라인 커뮤니티에서 화제가 된 게시물을
          한 곳에서 편리하게 모아볼 수 있는 큐레이션 플랫폼입니다.
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">수집 커뮤니티</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>에펨코리아 (FM Korea)</li>
          <li>디시인사이드 (DC Inside)</li>
          <li>루리웹 (Ruliweb)</li>
          <li>보배드림 (Bobaedream)</li>
          <li>도그드립 (Dogdrip)</li>
          <li>클리앙 (Clien)</li>
          <li>뽐뿌 (Ppomppu)</li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">서비스 특징</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>매시간 자동 업데이트되는 실시간 인기글</li>
          <li>일간 / 주간 / 월간 베스트 분류</li>
          <li>유머, 이슈, 정보/꿀팁 카테고리 제공</li>
          <li>다크모드 지원으로 편안한 읽기 환경</li>
          <li>검색 기능으로 원하는 글 빠르게 탐색</li>
        </ul>
        <p>
          본 사이트는 단순 복제가 아닌, 여러 커뮤니티의 인기 콘텐츠를 선별하고 정리하여
          사용자에게 더 나은 탐색 경험을 제공하는 것을 목표로 합니다.
          모든 게시물의 출처는 명확히 표기되며, 원본 사이트 링크를 제공합니다.
        </p>
      </div>
    </article>
  );
}
