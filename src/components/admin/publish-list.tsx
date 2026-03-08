"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishArticle, unpublishArticle } from "@/lib/admin/article-actions";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  GUIDE: "가이드",
  COMPARISON: "비교",
  TREND_ROUNDUP: "트렌드",
  ISSUE_BRIDGE: "이슈 해설",
  TOPIC_HUB: "토픽 허브",
};

interface PublishArticle {
  id: string;
  title: string;
  slug: string;
  articleType: string;
  projectName: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export default function PublishList({
  readyArticles,
  publishedArticles,
}: {
  readyArticles: PublishArticle[];
  publishedArticles: PublishArticle[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePublish = (articleId: string) => {
    startTransition(async () => {
      await publishArticle(articleId);
      router.refresh();
    });
  };

  const handleUnpublish = (articleId: string) => {
    if (!confirm("발행을 취소하시겠습니까?")) return;
    startTransition(async () => {
      await unpublishArticle(articleId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* 발행 대기 */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          발행 대기 ({readyArticles.length})
        </h2>
        {readyArticles.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 text-sm">발행 대기 중인 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyArticles.map((a) => (
              <div
                key={a.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/admin/drafts/${a.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {a.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">/{a.slug}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {TYPE_LABELS[a.articleType] || a.articleType}
                    </span>
                    {a.projectName && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{a.projectName}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handlePublish(a.id)}
                  disabled={isPending}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                  발행하기
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 발행된 글 */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          발행된 글 ({publishedArticles.length})
        </h2>
        {publishedArticles.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 text-sm">발행된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">제목</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">유형</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">공개 URL</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">발행일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {publishedArticles.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/drafts/${a.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600"
                        >
                          {a.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {TYPE_LABELS[a.articleType] || a.articleType}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/guide/${a.slug}`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                        >
                          /guide/{a.slug}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUnpublish(a.id)}
                          disabled={isPending}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                        >
                          발행 취소
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
