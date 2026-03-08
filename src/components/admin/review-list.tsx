"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveArticle, rejectArticle } from "@/lib/admin/article-actions";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  GUIDE: "가이드",
  COMPARISON: "비교",
  TREND_ROUNDUP: "트렌드",
  ISSUE_BRIDGE: "이슈 해설",
  TOPIC_HUB: "토픽 허브",
};

const CHECKLIST = [
  "원문 베끼기 아님",
  "문장/논리 자연스러움",
  "민감 표현 제거됨",
  "차별/비하/혐오 없음",
  "과장성 구매 유도 없음",
  "제휴 고지 포함 (해당 시)",
  "정보성 가치 확보",
  "이미지 출처/저작권 안전",
];

interface ReviewArticle {
  id: string;
  title: string;
  slug: string;
  articleType: string;
  status: string;
  summary: string | null;
  bodyMd: string;
  faqMd: string | null;
  affiliateDisclosureEnabled: boolean;
  projectName: string | null;
  updatedAt: string;
}

export default function ReviewList({ articles }: { articles: ReviewArticle[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean[]>>({});

  const toggleCheck = (articleId: string, index: number) => {
    setChecks((prev) => {
      const current = prev[articleId] || new Array(CHECKLIST.length).fill(false);
      const next = [...current];
      next[index] = !next[index];
      return { ...prev, [articleId]: next };
    });
  };

  const allChecked = (articleId: string) => {
    const c = checks[articleId];
    return c && c.every(Boolean);
  };

  const handleApprove = (articleId: string) => {
    startTransition(async () => {
      await approveArticle(articleId);
      router.refresh();
    });
  };

  const handleReject = (articleId: string) => {
    startTransition(async () => {
      await rejectArticle(articleId);
      router.refresh();
    });
  };

  if (articles.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-400">검수 대기 중인 글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((a) => {
        const isExpanded = expandedId === a.id;
        return (
          <div
            key={a.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              onClick={() => setExpandedId(isExpanded ? null : a.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{a.title}</h3>
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
                <span className="text-xs text-gray-400">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                {/* 요약 */}
                {a.summary && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{a.summary}</p>
                  </div>
                )}

                {/* 본문 미리보기 */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">본문 미리보기</h4>
                  <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {a.bodyMd.slice(0, 2000)}{a.bodyMd.length > 2000 ? "\n..." : ""}
                  </pre>
                </div>

                {/* 제휴 고지 상태 */}
                <div className="mb-4 text-xs">
                  <span className={a.affiliateDisclosureEnabled ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                    {a.affiliateDisclosureEnabled ? "제휴 고지 ON" : "제휴 고지 OFF"}
                  </span>
                </div>

                {/* 검수 체크리스트 */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">검수 체크리스트</h4>
                  <div className="space-y-1.5">
                    {CHECKLIST.map((item, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checks[a.id]?.[i] || false}
                          onChange={() => toggleCheck(a.id, i)}
                          className="w-3.5 h-3.5 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(a.id)}
                    disabled={isPending || !allChecked(a.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    승인 (발행 대기로)
                  </button>
                  <button
                    onClick={() => handleReject(a.id)}
                    disabled={isPending}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500 disabled:opacity-50 transition-colors"
                  >
                    반려 (수정 요청)
                  </button>
                  <Link
                    href={`/admin/drafts/${a.id}`}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    편집기에서 보기
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
