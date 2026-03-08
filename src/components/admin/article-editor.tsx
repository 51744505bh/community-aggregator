"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle, submitForReview, deleteArticle } from "@/lib/admin/article-actions";
import type { ArticleType } from "@/generated/prisma/client";

const ARTICLE_TYPES: { value: ArticleType; label: string }[] = [
  { value: "GUIDE", label: "가이드 (추천/구매)" },
  { value: "COMPARISON", label: "비교 (A vs B)" },
  { value: "TREND_ROUNDUP", label: "트렌드 라운드업" },
  { value: "ISSUE_BRIDGE", label: "이슈 해설" },
  { value: "TOPIC_HUB", label: "토픽 허브" },
];

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  articleType: string;
  projectId: string | null;
  summary: string | null;
  bodyMd: string;
  faqMd: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  affiliateDisclosureEnabled: boolean;
  status: string;
}

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
}

export default function ArticleEditor({
  article,
  projects,
}: {
  article?: ArticleData;
  projects: ProjectItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [articleType, setArticleType] = useState<ArticleType>((article?.articleType as ArticleType) || "GUIDE");
  const [projectId, setProjectId] = useState(article?.projectId || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [bodyMd, setBodyMd] = useState(article?.bodyMd || "");
  const [faqMd, setFaqMd] = useState(article?.faqMd || "");
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription || "");
  const [affiliateDisclosure, setAffiliateDisclosure] = useState(article?.affiliateDisclosureEnabled || false);
  const [showSeo, setShowSeo] = useState(false);

  const isEdit = !!article;

  const handleSave = () => {
    if (!title.trim() || !slug.trim() || !bodyMd.trim()) {
      setError("제목, 슬러그, 본문은 필수입니다.");
      return;
    }
    setError("");
    setSaved(false);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateArticle(article.id, {
            title, slug, articleType,
            projectId: projectId || null,
            summary, bodyMd, faqMd,
            seoTitle, metaDescription,
            affiliateDisclosureEnabled: affiliateDisclosure,
          });
          setSaved(true);
          router.refresh();
        } else {
          const created = await createArticle({
            title, slug, articleType,
            projectId: projectId || undefined,
            summary, bodyMd, faqMd,
            seoTitle, metaDescription,
            affiliateDisclosureEnabled: affiliateDisclosure,
          });
          router.push(`/admin/drafts/${created.id}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장 실패");
      }
    });
  };

  const handleSubmitReview = () => {
    if (!article) return;
    startTransition(async () => {
      try {
        await submitForReview(article.id);
        router.push("/admin/drafts");
      } catch (e) {
        setError(e instanceof Error ? e.message : "검수 요청 실패");
      }
    });
  };

  const handleDelete = () => {
    if (!article || !confirm("정말 삭제하시겠습니까?")) return;
    startTransition(async () => {
      try {
        await deleteArticle(article.id);
        router.push("/admin/drafts");
      } catch (e) {
        setError(e instanceof Error ? e.message : "삭제 실패");
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
          저장되었습니다.
        </div>
      )}

      {/* 기본 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">기본 정보</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEdit) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, "").replace(/\s+/g, "-"));
              }}
              placeholder="글 제목"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">슬러그 (URL) *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">글 유형</label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as ArticleType)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {ARTICLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">프로젝트</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">없음</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">요약 (10초 요약)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="핵심 내용을 2-3줄로 요약"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-y"
            />
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">본문 (Markdown) *</h2>
        <textarea
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value)}
          rows={20}
          placeholder="마크다운으로 본문을 작성하세요..."
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono resize-y"
        />
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">FAQ (선택, Markdown)</h2>
        <textarea
          value={faqMd}
          onChange={(e) => setFaqMd(e.target.value)}
          rows={6}
          placeholder="## Q. 질문&#10;답변&#10;&#10;## Q. 질문&#10;답변"
          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono resize-y"
        />
      </div>

      {/* 제휴 고지 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={affiliateDisclosure}
            onChange={(e) => setAffiliateDisclosure(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">제휴 링크 고지 표시</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &quot;이 글에는 제휴 링크가 포함될 수 있으며, 구매 시 수수료를 받을 수 있습니다.&quot;
            </p>
          </div>
        </label>
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <button
          onClick={() => setShowSeo(!showSeo)}
          className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          SEO 설정 {showSeo ? "▲" : "▼"}
        </button>
        {showSeo && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">SEO 제목</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="검색 결과에 표시될 제목"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">메타 설명</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder="검색 결과에 표시될 설명 (150자 이내)"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-y"
              />
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {isPending ? "저장 중..." : isEdit ? "저장" : "초안 생성"}
        </button>

        {isEdit && (article.status === "DRAFT" || article.status === "NEEDS_EDIT") && (
          <button
            onClick={handleSubmitReview}
            disabled={isPending}
            className="px-5 py-2.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-colors"
          >
            검수 요청
          </button>
        )}

        <button
          onClick={() => router.push("/admin/drafts")}
          className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors"
        >
          목록으로
        </button>

        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="ml-auto px-4 py-2.5 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
