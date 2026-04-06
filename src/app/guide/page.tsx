import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "가성비/추천 가이드 - Dripszone",
  description: "커뮤니티에서 반응 좋은 제품과 서비스를 비교하고 추천합니다. 가성비 좋은 선택을 도와드립니다.",
  robots: { index: true, follow: true },
};

const TYPE_LABELS: Record<string, string> = {
  GUIDE: "추천 가이드",
  COMPARISON: "비교 분석",
  TREND_ROUNDUP: "트렌드",
  ISSUE_BRIDGE: "이슈 해설",
  TOPIC_HUB: "토픽 허브",
};

const GUIDE_INTENTS = [
  {
    title: "가성비 구매 전 빠르게 비교",
    body: "돈을 쓰기 전에 핵심 스펙과 후기 포인트만 빠르게 확인할 수 있는 비교형 글을 우선 배치합니다.",
  },
  {
    title: "유행 이슈를 실구매 판단으로 연결",
    body: "커뮤니티에서 화제가 된 제품이나 서비스가 실제로 살 만한지, 대체재는 무엇인지까지 연결합니다.",
  },
  {
    title: "실패 확률 낮은 입문 선택지 정리",
    body: "처음 사는 사람도 무리 없이 고를 수 있도록 가격대별 무난한 선택지를 먼저 정리합니다.",
  },
];

export default async function GuidePage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      summary: true,
      articleType: true,
      publishedAt: true,
      project: { select: { name: true } },
    },
  });

  const featured = articles.slice(0, 3);
  const comparisonCount = articles.filter((article) => article.articleType === "COMPARISON").length;
  const guideCount = articles.filter((article) => article.articleType === "GUIDE").length;
  const roundupCount = articles.filter((article) => article.articleType === "TREND_ROUNDUP").length;

  return (
    <>
      <section className="mb-6 rounded-3xl bg-[linear-gradient(135deg,#052e16,#166534_55%,#bbf7d0)] p-6 text-white shadow-sm">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          전환 중심 허브
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">가성비/추천 가이드</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50">
          커뮤니티에서 화제가 된 제품과 서비스를 바로 구매 판단으로 연결합니다. 가격, 후기, 사용 장면을
          함께 보고 빠르게 고를 수 있도록 구성합니다.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-emerald-100">추천 가이드</p>
            <p className="mt-2 text-2xl font-bold">{guideCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-emerald-100">비교 분석</p>
            <p className="mt-2 text-2xl font-bold">{comparisonCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-emerald-100">트렌드/정리</p>
            <p className="mt-2 text-2xl font-bold">{roundupCount}</p>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        {GUIDE_INTENTS.map((intent) => (
          <div
            key={intent.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{intent.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{intent.body}</p>
          </div>
        ))}
      </section>

      {featured.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">지금 바로 보기 좋은 추천형 콘텐츠</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                구매 의도 높은 주제부터 먼저 배치했습니다.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {featured.map((a) => (
              <Link
                key={a.slug}
                href={`/guide/${a.slug}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {TYPE_LABELS[a.articleType] || a.articleType}
                </span>
                <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                {a.summary && (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{a.summary}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {articles.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">준비 중입니다</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Dripszone 에디터가 직접 조사하고 비교한 추천 가이드를 곧 만나보실 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/guide/${a.slug}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {TYPE_LABELS[a.articleType] || a.articleType}
                </span>
                {a.project && (
                  <span className="text-xs text-gray-400">{a.project.name}</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{a.title}</h3>
              {a.summary && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.summary}</p>
              )}
              <span className="inline-block mt-2 text-xs text-gray-400">
                {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("ko-KR") : ""}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; 홈으로 돌아가기
        </Link>
      </div>
    </>
  );
}
