"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignCuratedPost,
  hideCuratedPost,
  resetCuratedPost,
  saveCuratedPostDraft,
  type CuratedBucketInput,
} from "@/lib/admin/curation-actions";

type EditorData = {
  postId: string;
  originalUrl: string;
  originalTitle: string;
  originalSummary: string;
  originalBody: string;
  initialCuratorName: string;
  initialCategory: string;
  initialTitle: string;
  initialSummary: string;
  initialBody: string;
  initialCachedViewCount: number;
  status: "PENDING" | "APPROVED" | "HIDDEN" | "UNREVIEWED";
};

const CATEGORY_OPTIONS = [
  { value: "", label: "미지정" },
  { value: "humor", label: "유머" },
  { value: "issue", label: "이슈" },
  { value: "info", label: "정보/꿀팁" },
];

const APPROVALS: { label: string; bucket: CuratedBucketInput }[] = [
  { label: "24시간 승인", bucket: "BEST_24H" },
  { label: "주간 승인", bucket: "BEST_WEEKLY" },
  { label: "월간 승인", bucket: "BEST_MONTHLY" },
];

export default function CurationEditor({ data }: { data: EditorData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [curatorName, setCuratorName] = useState(data.initialCuratorName);
  const [category, setCategory] = useState(data.initialCategory);
  const [title, setTitle] = useState(data.initialTitle || data.originalTitle);
  const [summary, setSummary] = useState(data.initialSummary || data.originalSummary);
  const [body, setBody] = useState(data.initialBody || data.originalBody);
  const [cachedViewCount, setCachedViewCount] = useState(String(data.initialCachedViewCount || 0));

  const statusLabel =
    data.status === "APPROVED"
      ? "승인됨"
      : data.status === "HIDDEN"
        ? "제외됨"
        : "미검토";

  const buildDraftPayload = () => ({
    curatorName,
    customCategory: category,
    customTitle: title.trim() === data.originalTitle.trim() ? "" : title,
    customSummary: summary.trim() === data.originalSummary.trim() ? "" : summary,
    customBodyMd: body.trim() === data.originalBody.trim() ? "" : body,
    cachedViewCount: Number.isFinite(Number(cachedViewCount)) ? Number(cachedViewCount) : null,
  });

  const runAction = (action: () => Promise<void>) => {
    startTransition(async () => {
      try {
        setError(null);
        await action();
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "저장에 실패했습니다.");
      }
    });
  };

  const saveDraft = () =>
    runAction(() => saveCuratedPostDraft(data.postId, buildDraftPayload()));

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600">상태 {statusLabel}</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600">원문 편집 오버라이드</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">{data.originalTitle}</h1>
        <a
          href={data.originalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          원문 링크 열기
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <label className="block text-sm font-medium text-gray-700">게시자 닉네임</label>
            <input
              value={curatorName}
              onChange={(e) => setCuratorName(e.target.value)}
              className="mt-2 h-10 w-full rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">게시 탭 카테고리</label>
              <button
                type="button"
                onClick={() => setCategory(data.initialCategory)}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                원문으로 되돌리기
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 h-10 w-full rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-400">
              직접 지정한 탭만 공개 카테고리에 반영됩니다.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">공개 제목</label>
              <button
                type="button"
                onClick={() => setTitle(data.originalTitle)}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                원문으로 되돌리기
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 h-10 w-full rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
            />
            <p className="mt-2 text-xs text-gray-400">지금은 원문 제목이 기본으로 채워져 있습니다.</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">공개 요약</label>
              <button
                type="button"
                onClick={() => setSummary(data.originalSummary)}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                원문으로 되돌리기
              </button>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">공개 본문</label>
              <button
                type="button"
                onClick={() => setBody(data.originalBody)}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                원문으로 되돌리기
              </button>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className="mt-2 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-gray-900"
            />
            <p className="mt-2 text-xs text-gray-400">
              여기서 고친 내용이 승인 후 공개 페이지 본문으로 바로 사용됩니다.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <label className="block text-sm font-medium text-gray-700">표시용 조회수 보정</label>
            <input
              value={cachedViewCount}
              onChange={(e) => setCachedViewCount(e.target.value)}
              className="mt-2 h-10 w-full rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
            />
            <p className="mt-2 text-xs text-gray-400">
              기본은 30분 캐시된 우리 사이트 조회수입니다. 필요할 때만 수동 보정값으로 덮어씁니다.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-700">저장 및 승인</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                disabled={isPending}
                onClick={saveDraft}
                className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                수정 저장
              </button>
              {APPROVALS.map((approval) => (
                <button
                  key={approval.bucket}
                  disabled={isPending}
                  onClick={() =>
                    runAction(async () => {
                      await saveCuratedPostDraft(data.postId, buildDraftPayload());
                      await assignCuratedPost(data.postId, approval.bucket);
                    })
                  }
                  className="rounded border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  {approval.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                disabled={isPending}
                onClick={() => runAction(() => hideCuratedPost(data.postId))}
                className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                제외
              </button>
              <button
                disabled={isPending}
                onClick={() => runAction(() => resetCuratedPost(data.postId))}
                className="rounded border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                초기화
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-700">원문 참고</p>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500">원문 제목</p>
                <p className="mt-1 text-gray-900">{data.originalTitle}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">원문 요약</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{data.originalSummary || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">원문 본문</p>
                <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs text-gray-600">
                  {data.originalBody || "-"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
