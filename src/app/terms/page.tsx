import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 - Dripszone",
  description: "Dripszone 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">이용약관</h1>
      <div className="text-gray-700 dark:text-gray-300 space-y-6 text-sm leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">1. 목적</h2>
          <p>
            이 약관은 Dripszone(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 서비스 제공자와 이용자 간의
            권리, 의무, 책임 사항 및 기타 필요한 사항을 규정합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">2. 서비스 내용</h2>
          <p>
            Dripszone는 국내 주요 온라인 커뮤니티의 화제 게시물을 수집하고 정리하여 제공하는
            유머/정보 미디어 서비스입니다. 서비스 내용은 다음을 포함합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>커뮤니티 인기 게시물 수집 및 정리</li>
            <li>에디터 기사 (이슈 해설, 정보 정리, 추천 가이드 등)</li>
            <li>화제 키워드 및 토픽 허브</li>
            <li>댓글, 좋아요 등 이용자 참여 기능</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">3. 이용자의 의무</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인의 권리를 침해하는 댓글이나 콘텐츠를 작성하지 않습니다.</li>
            <li>서비스를 이용하여 불법적인 활동을 하지 않습니다.</li>
            <li>광고 클릭을 인위적으로 유도하거나 조작하지 않습니다.</li>
            <li>서비스의 정상적인 운영을 방해하는 행위를 하지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">4. 지적재산권</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>수집된 커뮤니티 게시물의 저작권은 원저작자에게 있습니다.</li>
            <li>Dripszone 에디터가 작성한 콘텐츠의 저작권은 Dripszone에 있습니다.</li>
            <li>이용자가 작성한 댓글의 저작권은 해당 이용자에게 있으며, 서비스 내 노출에 동의한 것으로 간주합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">5. 서비스 변경 및 중단</h2>
          <p>
            서비스 제공자는 운영상, 기술상의 필요에 의해 서비스 내용을 변경하거나 중단할 수 있습니다.
            중대한 변경이 있는 경우 사전에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">6. 면책 조항</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dripszone는 수집된 게시물의 정확성, 신뢰성에 대해 보증하지 않습니다.</li>
            <li>이용자 간 또는 이용자와 제3자 간 분쟁에 대해 Dripszone는 책임을 지지 않습니다.</li>
            <li>외부 링크의 콘텐츠에 대해 Dripszone는 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">7. 약관 변경</h2>
          <p>
            이 약관은 서비스 개선에 따라 변경될 수 있으며, 변경 사항은 서비스 내에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">8. 문의</h2>
          <p>
            이용약관 관련 문의는{" "}
            <a href="mailto:51744505bh@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              51744505bh@gmail.com
            </a>
            으로 연락해주세요.
          </p>
        </section>

        <p className="text-gray-400 dark:text-gray-500 text-xs mt-6">
          시행일: 2026년 3월 6일
        </p>
      </div>
    </article>
  );
}
