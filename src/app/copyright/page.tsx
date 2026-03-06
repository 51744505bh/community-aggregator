import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "저작권 안내 - Dripszone",
  description: "Dripszone의 저작권 정책과 콘텐츠 삭제 요청 방법을 안내합니다.",
};

export default function CopyrightPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">저작권 안내</h1>
      <div className="text-gray-700 dark:text-gray-300 space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. 저작권 원칙</h2>
          <p>
            Dripszone는 국내 주요 온라인 커뮤니티의 인기 게시물을 수집하여 정리하는 서비스입니다.
            모든 원본 게시물의 저작권은 해당 원저작자에게 있으며,
            Dripszone는 원문의 핵심을 요약/정리하여 독자에게 유용한 정보를 제공하는 것을 목표로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. 콘텐츠 이용 방식</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>원문 전체를 복사하지 않으며, 요약과 맥락 설명을 중심으로 정리합니다.</li>
            <li>모든 게시물에 원본 출처와 원문 링크를 명시합니다.</li>
            <li>이미지 사용 시 출처를 표기하며, 저작권자 요청 시 즉시 제거합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. 삭제 요청 (DMCA / 저작권 침해 신고)</h2>
          <p>
            본인의 게시물이 Dripszone에 게재되어 있고, 삭제를 원하시는 경우 아래 정보와 함께 이메일로 요청해주세요.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-2 space-y-2">
            <p><strong className="text-gray-900 dark:text-white">필요 정보:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>삭제를 요청하는 Dripszone 페이지 URL</li>
              <li>원본 게시물 URL</li>
              <li>본인 확인이 가능한 정보 (원본 작성자 닉네임 등)</li>
              <li>삭제 사유</li>
            </ul>
            <p className="mt-2">
              <strong className="text-gray-900 dark:text-white">이메일:</strong>{" "}
              <a href="mailto:51744505bh@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                51744505bh@gmail.com
              </a>
            </p>
          </div>
          <p className="mt-2">
            정당한 삭제 요청은 확인 후 <strong>영업일 기준 3일 이내</strong>에 처리됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. Dripszone 자체 콘텐츠</h2>
          <p>
            Dripszone 에디터가 직접 작성한 기사, 가이드, 요약, 해설 콘텐츠의 저작권은 Dripszone에 있습니다.
            무단 복제, 배포, 수정은 허용되지 않으며, 인용 시 출처를 명시해주세요.
          </p>
        </section>

        <p className="text-gray-400 dark:text-gray-500 text-xs mt-6">
          시행일: 2026년 3월 6일
        </p>
      </div>
    </article>
  );
}
