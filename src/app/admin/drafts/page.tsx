import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "초안 관리 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "초안",
  NEEDS_EDIT: "수정 필요",
  READY_TO_REVIEW: "검수 대기",
  IN_REVIEW: "검수 중",
  READY_TO_PUBLISH: "발행 대기",
  PUBLISHED: "발행됨",
  ARCHIVED: "보관",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  NEEDS_EDIT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  READY_TO_REVIEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_REVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  READY_TO_PUBLISH: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ARCHIVED: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500",
};

const TYPE_LABELS: Record<string, string> = {
  GUIDE: "가이드",
  COMPARISON: "비교",
  TREND_ROUNDUP: "트렌드",
  ISSUE_BRIDGE: "이슈 해설",
  TOPIC_HUB: "토픽 허브",
};

export default async function AdminDraftsPage() {
  await requireAdmin();

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">초안 관리</h1>
        <Link
          href="/admin/drafts/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
        >
          + 새 글 작성
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-400">작성된 글이 없습니다.</p>
          <Link
            href="/admin/drafts/new"
            className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            첫 번째 글을 작성해보세요 &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">제목</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">유형</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">프로젝트</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">수정일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/drafts/${a.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {a.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">/{a.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{TYPE_LABELS[a.articleType] || a.articleType}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {a.project?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {a.updatedAt.toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
