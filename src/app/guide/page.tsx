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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">가성비/추천 가이드</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          커뮤니티에서 반응 좋은 제품과 서비스를 비교하고, 가성비 좋은 선택을 돕습니다.
        </p>
      </div>

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
