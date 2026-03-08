import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

const TYPE_LABELS: Record<string, string> = {
  GUIDE: "추천 가이드",
  COMPARISON: "비교 분석",
  TREND_ROUNDUP: "트렌드",
  ISSUE_BRIDGE: "이슈 해설",
  TOPIC_HUB: "토픽 허브",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, seoTitle: true, metaDescription: true, summary: true, ogImageUrl: true },
  });

  if (!article) return { title: "Not Found" };

  return {
    title: `${article.seoTitle || article.title} - Dripszone`,
    description: article.metaDescription || article.summary || "",
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.metaDescription || article.summary || "",
      ...(article.ogImageUrl && { images: [article.ogImageUrl] }),
    },
    robots: { index: true, follow: true },
  };
}

function renderMarkdown(md: string): string {
  let html = md;
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-gray-900 dark:text-white mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h1>');
  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Links with rel="sponsored nofollow" for safety
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" rel="nofollow sponsored" target="_blank">$1</a>');
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-gray-700 dark:text-gray-300">$1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">');
  html = '<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">' + html + '</p>';
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  return html;
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { project: { select: { name: true, slug: true } } },
  });

  if (!article || article.status !== "PUBLISHED") notFound();

  return (
    <>
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">홈</Link>
        <span>/</span>
        <Link href="/guide" className="hover:text-gray-600 dark:hover:text-gray-300">가이드</Link>
        {article.project && (
          <>
            <span>/</span>
            <span>{article.project.name}</span>
          </>
        )}
      </nav>

      {/* 배지 + 제목 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {TYPE_LABELS[article.articleType] || article.articleType}
          </span>
          {article.project && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{article.project.name}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
          {article.publishedAt && (
            <span>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</span>
          )}
          <span>Dripszone 에디터</span>
        </div>
      </div>

      {/* 제휴 고지 */}
      {article.affiliateDisclosureEnabled && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            이 글에는 제휴 링크가 포함될 수 있으며, 구매가 발생하면 수수료를 받을 수 있습니다. 가격과 재고는 수시로 변동될 수 있습니다.
          </p>
        </div>
      )}

      {/* 10초 요약 */}
      {article.summary && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1">10초 요약</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">{article.summary}</p>
        </div>
      )}

      <AdBanner type="adsense" />

      {/* 본문 */}
      <article
        className="prose-custom mb-8"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.bodyMd) }}
      />

      {/* FAQ */}
      {article.faqMd && (
        <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">자주 묻는 질문</h2>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.faqMd) }} />
        </div>
      )}

      <AdBanner type="coupang" />

      {/* 하단 네비게이션 */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Link
          href="/guide"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          &larr; 가이드 목록
        </Link>
        <Link
          href="/"
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          홈으로
        </Link>
      </div>
    </>
  );
}
