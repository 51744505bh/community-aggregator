"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignCuratedPost,
  hideCuratedPost,
  moveCuratedPostCategory,
  resetCuratedPost,
  type CuratedBucketInput,
} from "@/lib/admin/curation-actions";
import { createArticleFromCrawledPost } from "@/lib/admin/article-actions";

type InboxItem = {
  id: string;
  title: string;
  originalUrl: string;
  source: string;
  sourceName: string;
  category: string;
  period: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  crawledAt: string;
  crawledAtLabel: string;
  communityPath: string;
  decision: {
    status: "PENDING" | "APPROVED" | "HIDDEN";
    bucket: CuratedBucketInput | null;
    curatorName: string | null;
    customCategory?: string | null;
  } | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  humor: "유머",
  issue: "이슈",
  info: "정보/꿀팁",
};

const CATEGORY_TAB_STYLES: Record<string, string> = {
  all: "border-gray-300 bg-white text-gray-700",
  humor: "border-amber-200 bg-amber-50 text-amber-800",
  issue: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const STATUS_TAB_STYLES: Record<string, string> = {
  all: "border-gray-300 bg-white text-gray-700",
  unreviewed: "border-slate-200 bg-slate-50 text-slate-700",
  approved: "border-green-200 bg-green-50 text-green-800",
  hidden: "border-red-200 bg-red-50 text-red-700",
};

const BUCKET_BUTTONS: { bucket: CuratedBucketInput; label: string }[] = [
  { bucket: "BEST_24H", label: "24H 승인" },
  { bucket: "BEST_WEEKLY", label: "주간 승인" },
  { bucket: "BEST_MONTHLY", label: "월간 승인" },
];

const QUICK_CATEGORY_BUTTONS = [
  { value: "humor", label: "유머", className: "border-amber-200 text-amber-700 hover:bg-amber-50" },
  { value: "issue", label: "이슈", className: "border-rose-200 text-rose-700 hover:bg-rose-50" },
  { value: "info", label: "정보", className: "border-emerald-200 text-emerald-700 hover:bg-emerald-50" },
];

export default function CurationInbox({ items }: { items: InboxItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const isEffectivelyApproved = (item: InboxItem) =>
    Boolean(
      item.decision &&
        (item.decision.status === "APPROVED" ||
          (item.decision.status === "PENDING" && item.decision.bucket))
    );

  const categoryCounts = useMemo(() => {
    return {
      all: items.length,
      humor: items.filter((item) => item.category === "humor").length,
      issue: items.filter((item) => item.category === "issue").length,
      info: items.filter((item) => item.category === "info").length,
    };
  }, [items]);

  const statusCounts = useMemo(() => {
    return {
      all: items.length,
      unreviewed: items.filter((item) => !item.decision || (item.decision.status === "PENDING" && !item.decision.bucket))
        .length,
      approved: items.filter((item) => isEffectivelyApproved(item)).length,
      hidden: items.filter((item) => item.decision?.status === "HIDDEN").length,
    };
  }, [items]);

  const sourceOptions = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const item of items) {
      const entry = counts.get(item.source) || { label: item.sourceName, count: 0 };
      entry.count += 1;
      counts.set(item.source, entry);
    }

    return Array.from(counts.entries())
      .map(([value, meta]) => ({ value, label: meta.label, count: meta.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        query.trim() === "" ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.sourceName.toLowerCase().includes(query.toLowerCase());

      const matchesDecision =
        decisionFilter === "all" ||
        (decisionFilter === "approved" && isEffectivelyApproved(item)) ||
        (decisionFilter === "hidden" && item.decision?.status === "HIDDEN") ||
        (decisionFilter === "unreviewed" &&
          (!item.decision || (item.decision.status === "PENDING" && !item.decision.bucket)));

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesSource = sourceFilter === "all" || item.source === sourceFilter;

      return matchesQuery && matchesDecision && matchesCategory && matchesSource;
    });
  }, [categoryFilter, decisionFilter, items, query, sourceFilter]);

  const runAction = (action: () => Promise<void>) => {
    startTransition(async () => {
      try {
        setError(null);
        await action();
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "큐레이션 저장에 실패했습니다.");
      }
    });
  };

  const createDraft = (postId: string) => {
    startTransition(async () => {
      try {
        setError(null);
        const article = await createArticleFromCrawledPost(postId);
        router.push(`/admin/drafts/${article.id}`);
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "초안 생성에 실패했습니다.");
      }
    });
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              카테고리 탭
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "전체" },
                { value: "humor", label: "유머" },
                { value: "issue", label: "이슈" },
                { value: "info", label: "정보/꿀팁" },
              ].map((tab) => {
                const isActive = categoryFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setCategoryFilter(tab.value)}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      CATEGORY_TAB_STYLES[tab.value]
                    } ${isActive ? "ring-2 ring-gray-900/10" : "opacity-80 hover:opacity-100"}`}
                  >
                    {tab.label} <span className="ml-1 text-xs opacity-70">{categoryCounts[tab.value as keyof typeof categoryCounts]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              상태 탭
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "전체" },
                { value: "unreviewed", label: "미검토" },
                { value: "approved", label: "승인됨" },
                { value: "hidden", label: "제외됨" },
              ].map((tab) => {
                const isActive = decisionFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setDecisionFilter(tab.value)}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      STATUS_TAB_STYLES[tab.value]
                    } ${isActive ? "ring-2 ring-gray-900/10" : "opacity-80 hover:opacity-100"}`}
                  >
                    {tab.label} <span className="ml-1 text-xs opacity-70">{statusCounts[tab.value as keyof typeof statusCounts]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목 또는 출처 검색"
              className="h-10 rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
            />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-10 rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
            >
              <option value="all">전체 출처</option>
              {sourceOptions.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label} ({source.count})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((source) => {
              const isActive = sourceFilter === source.value;
              return (
                <button
                  key={source.value}
                  type="button"
                  onClick={() => setSourceFilter(isActive ? "all" : source.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {source.label} {source.count}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-700">
              현재 {filteredItems.length}건
            </span>
            <span>카테고리: {categoryFilter === "all" ? "전체" : CATEGORY_LABELS[categoryFilter] || categoryFilter}</span>
            <span>상태: {decisionFilter === "all" ? "전체" : decisionFilter}</span>
            <span>출처: {sourceFilter === "all" ? "전체" : sourceOptions.find((source) => source.value === sourceFilter)?.label || sourceFilter}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">
                    {item.sourceName}
                  </span>
                  <span>{CATEGORY_LABELS[item.category] || item.category}</span>
                  <span>{item.period}</span>
                  <span>{item.crawledAtLabel}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-gray-900">{item.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {item.viewCount > 0 && <span>조회 {item.viewCount.toLocaleString()}</span>}
                  <span>추천 {item.likeCount.toLocaleString()}</span>
                  <span>댓글 {item.commentCount.toLocaleString()}</span>
                  <Link href={item.communityPath} className="font-medium text-blue-600 hover:text-blue-700">
                    상세 보기
                  </Link>
                  <a
                    href={item.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-gray-600 hover:text-gray-900"
                  >
                    원문 보기
                  </a>
                </div>
              </div>

              <div className="min-w-[280px]">
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  {item.decision ? (
                    <span
                      className={`rounded px-2 py-1 font-medium ${
                        item.decision.status === "HIDDEN"
                          ? "bg-red-100 text-red-700"
                          : item.decision.status === "PENDING" && !item.decision.bucket
                            ? "bg-slate-100 text-slate-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.decision.status === "HIDDEN" ? "제외됨" : null}
                      {item.decision.status === "PENDING" && !item.decision.bucket ? "미검토" : null}
                      {(item.decision.status === "APPROVED" || (item.decision.status === "PENDING" && item.decision.bucket))
                        ? `승인됨 ${item.decision.bucket ? `· ${item.decision.bucket}` : ""}`
                        : null}
                    </span>
                  ) : (
                    <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600">미검토</span>
                  )}
                  {item.decision?.curatorName && (
                    <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600">
                      {item.decision.curatorName}
                    </span>
                  )}
                </div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {QUICK_CATEGORY_BUTTONS.map((button) => (
                    <button
                      key={button.value}
                      disabled={isPending}
                      onClick={() => runAction(() => moveCuratedPostCategory(item.id, button.value))}
                      className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${button.className}`}
                    >
                      {button.label} 승인
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => createDraft(item.id)}
                    className="rounded border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                  >
                    편집실로 보내기
                  </button>
                  <Link
                    href={`/admin/inbox/${encodeURIComponent(item.id)}`}
                    className="rounded border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    글 수정
                  </Link>
                  {BUCKET_BUTTONS.map((button) => (
                    <button
                      key={button.bucket}
                      disabled={isPending}
                      onClick={() => runAction(() => assignCuratedPost(item.id, button.bucket))}
                      className="rounded border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      {button.label}
                    </button>
                  ))}
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => hideCuratedPost(item.id))}
                    className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    제외
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => runAction(() => resetCuratedPost(item.id))}
                    className="rounded border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            조건에 맞는 수집 글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
