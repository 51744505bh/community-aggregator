export default function PrivacyPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">개인정보처리방침</h1>
      <div className="text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed">
        <p>
          커뮤니티 인기글(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 중요시하며,
          관련 법령을 준수합니다.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">1. 수집하는 개인정보</h2>
        <p>
          본 서비스는 별도의 회원가입 절차가 없으며, 이용자의 개인정보를 직접 수집하지 않습니다.
          다만, 서비스 이용 과정에서 아래 정보가 자동으로 생성되어 수집될 수 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>방문 일시, 페이지 조회 기록</li>
          <li>브라우저 종류 및 운영체제 정보</li>
          <li>IP 주소</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">2. 개인정보의 이용 목적</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스 이용 통계 분석 및 개선</li>
          <li>부정 이용 방지</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">3. 쿠키(Cookie) 사용</h2>
        <p>
          본 서비스는 이용자 경험 개선을 위해 쿠키를 사용할 수 있습니다.
          이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
          일부 기능 이용에 제한이 있을 수 있습니다.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">4. 광고</h2>
        <p>
          본 서비스는 Google AdSense를 통해 광고를 게재합니다.
          Google은 이용자의 관심사에 기반한 광고를 제공하기 위해 쿠키를 사용할 수 있습니다.
          자세한 내용은{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Google 광고 정책
          </a>
          을 참고하세요.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">5. 개인정보의 보유 및 파기</h2>
        <p>
          자동 수집된 접속 로그는 통계 목적으로만 활용되며,
          수집일로부터 1년 이내에 파기합니다.
        </p>

        <h2 className="text-base font-semibold text-gray-900 dark:text-white">6. 문의</h2>
        <p>
          개인정보 관련 문의는 51744505bh@gmail.com으로 연락해주세요.
        </p>

        <p className="text-gray-400 dark:text-gray-500 text-xs mt-6">
          시행일: 2026년 3월 4일
        </p>
      </div>
    </article>
  );
}
