export default function ContactPage() {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact</h1>
      <div className="text-gray-700 dark:text-gray-300 space-y-4">
        <p>
          서비스 이용 중 문의사항이나 제안이 있으시면 아래 방법으로 연락해주세요.
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
          <p><strong className="text-gray-900 dark:text-white">이메일:</strong> 51744505bh@gmail.com</p>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">문의 유형</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스 이용 관련 문의</li>
          <li>게시물 삭제 요청 (저작권 관련)</li>
          <li>버그 신고 및 개선 제안</li>
          <li>광고 및 제휴 문의</li>
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          게시물 삭제 요청 시, 해당 게시물의 URL과 삭제 사유를 함께 보내주시면
          빠르게 처리해드리겠습니다.
        </p>
      </div>
    </article>
  );
}
