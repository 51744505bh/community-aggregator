import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "편집 정책 - Dripszone",
  description: "Dripszone의 콘텐츠 편집 원칙과 운영 정책을 안내합니다.",
};

export default function EditorialPolicyPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">편집 정책</h1>
      <div className="text-gray-700 dark:text-gray-300 space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dripszone의 편집 원칙</h2>
          <p>
            Dripszone는 커뮤니티와 실생활에서 뜨는 화제를 빠르게 정리하고,
            독자가 시간을 아끼고 정확하게 이해하도록 돕는 유머/정보 미디어입니다.
            아래 원칙에 따라 콘텐츠를 편집하고 운영합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. 정확성 우선</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>팩트 확인이 가능한 내용만 게재합니다.</li>
            <li>출처를 명확히 표기합니다.</li>
            <li>오류가 발견되면 즉시 수정하고, 수정 이력을 남깁니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. 독자 가치 중심</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>단순한 원문 복사가 아닌, 맥락 설명과 핵심 요약을 제공합니다.</li>
            <li>독자가 원문을 보지 않아도 핵심을 파악할 수 있도록 정리합니다.</li>
            <li>자극적인 제목이나 낚시성 콘텐츠를 지양합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. 저작권 존중</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>원문의 핵심을 직접 재서술하며, 전문 복사를 하지 않습니다.</li>
            <li>이미지와 미디어는 출처를 명시합니다.</li>
            <li>저작권자의 삭제 요청에 신속히 대응합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. 광고와 콘텐츠의 분리</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>광고성 콘텐츠는 &ldquo;광고&rdquo;, &ldquo;협찬&rdquo;, &ldquo;스폰서&rdquo; 등으로 명확히 표시합니다.</li>
            <li>광고가 편집 콘텐츠를 방해하지 않도록 배치합니다.</li>
            <li>제휴 링크가 포함된 경우 이를 고지합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. 콘텐츠 안전 기준</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>노골적인 성적 콘텐츠, 혐오/차별 조장, 폭력 미화 콘텐츠를 게재하지 않습니다.</li>
            <li>미성년자 보호 원칙을 준수합니다.</li>
            <li>범죄 수법이나 위험 행위를 구체적으로 설명하지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">6. AI 사용 원칙</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>AI는 초안 작성 보조 도구로만 활용합니다.</li>
            <li>AI 생성 콘텐츠는 반드시 사람이 검수하고 편집한 후 게재합니다.</li>
            <li>AI만으로 작성된 콘텐츠를 그대로 발행하지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">7. 수정 및 업데이트</h2>
          <p>
            이 편집 정책은 서비스 개선에 따라 수정될 수 있습니다.
            정책 관련 문의는 <a href="mailto:51744505bh@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">51744505bh@gmail.com</a>으로 연락해주세요.
          </p>
        </section>

        <p className="text-gray-400 dark:text-gray-500 text-xs mt-6">
          시행일: 2026년 3월 6일
        </p>
      </div>
    </article>
  );
}
