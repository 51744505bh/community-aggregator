import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "광고/제휴 안내 - Dripszone",
  description: "Dripszone 광고 및 제휴 안내입니다. 배너 광고, 네이티브 콘텐츠, 브랜드 정리 기사, 장기 제휴 패키지를 제안합니다.",
};

export default function AdvertisePage() {
  return (
    <article className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-[linear-gradient(135deg,#0f172a,#1e293b_45%,#dbeafe)] p-8 text-white shadow-sm dark:border-gray-700">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-blue-200">Dripszone 광고 · 제휴 안내</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight">
            화제성 콘텐츠와 추천형 콘텐츠를 함께 운영하는 전환형 미디어
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200">
            Dripszone는 사람들이 지금 반응하는 주제를 빠르게 정리하고, 그 안에서 실제로 도움이 되는
            정보와 추천까지 연결하는 콘텐츠 구조를 지향합니다. 브랜드 노출과 반응 유도를 함께 설계할 수 있습니다.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:51744505bh@gmail.com?subject=Dripszone%20광고%20문의"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              광고 문의하기
            </a>
            <a
              href="mailto:51744505bh@gmail.com?subject=Dripszone%20제휴%20제안"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              제휴 제안 보내기
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "생활용품",
          "디지털 액세서리",
          "식품/간식",
          "앱/서비스",
          "자취/정리/수납",
          "가성비 소비층 타깃 제품",
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              화제성 유입과 추천형 전환이 함께 필요한 브랜드에 맞습니다.
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">가능한 협업 형태</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ["배너 광고", ["메인페이지 노출", "기사 하단 노출", "모바일 전용 중간 삽입형"]],
            ["네이티브 콘텐츠", ["브랜드/제품 소개형 기사", "정보형 정리 기사 안 자연스러운 배치", "특정 주제 기반 추천형 콘텐츠"]],
            ["브랜드 정리 기사", ["제품/서비스 핵심 요약", "대상 독자 기준 장단점 정리", "사용 상황별 포인트 정리"]],
            ["장기 제휴", ["카테고리 고정 노출", "시리즈형 콘텐츠 협업", "월 단위 배너 + 기사 패키지"]],
          ].map(([title, items]) => (
            <div key={title} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/40">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {(items as string[]).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dripszone가 적합한 이유</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li>빠른 화제 반영과 핵심만 요약하는 콘텐츠 구조</li>
            <li>추천형 기사와 연결되는 전환형 동선 설계</li>
            <li>모바일 소비에 맞춘 짧고 명확한 읽기 흐름</li>
            <li>이슈형 유입과 구매 의도형 콘텐츠를 함께 운영</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">진행 방식</h2>
          <ol className="mt-4 space-y-2 text-sm text-blue-900 dark:text-blue-100">
            <li>1. 문의 접수</li>
            <li>2. 업종과 목적 확인</li>
            <li>3. 가장 맞는 광고 형식 제안</li>
            <li>4. 일정 및 노출 방식 확정</li>
            <li>5. 집행 후 결과 공유</li>
          </ol>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">문의 방법</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          브랜드명, 제품 또는 서비스 소개, 희망 일정, 예산 범위를 함께 보내주시면 더 빠르게 검토할 수 있습니다.
        </p>
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            <a href="mailto:51744505bh@gmail.com" className="hover:underline">
              51744505bh@gmail.com
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            추후 월 방문자 수, 모바일 비중, 인기 카테고리, 성과 사례 영역을 추가할 수 있습니다.
          </p>
        </div>
      </section>
    </article>
  );
}
