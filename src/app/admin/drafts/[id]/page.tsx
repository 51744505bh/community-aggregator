import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleEditor from "@/components/admin/article-editor";

export const metadata: Metadata = {
  title: "글 편집 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      sources: { select: { sourceUrl: true, note: true } },
    },
  });
  if (!article) notFound();

  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const serialized = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    articleType: article.articleType,
    projectId: article.projectId,
    summary: article.summary,
    bodyMd: article.bodyMd,
    faqMd: article.faqMd,
    seoTitle: article.seoTitle,
    metaDescription: article.metaDescription,
    affiliateDisclosureEnabled: article.affiliateDisclosureEnabled,
    status: article.status,
    origin: article.origin,
    sourceNotes: article.sourceNotes,
    sourceUrls: article.sources.map((s) => s.sourceUrl),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">글 편집</h1>
      <ArticleEditor article={serialized} projects={projects} />
    </div>
  );
}
