import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ReviewList from "@/components/admin/review-list";

export const metadata: Metadata = {
  title: "검수 대기 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminReviewPage() {
  await requireAdmin();

  const articles = await prisma.article.findMany({
    where: { status: { in: ["READY_TO_REVIEW", "IN_REVIEW"] } },
    orderBy: { updatedAt: "desc" },
    include: { project: { select: { name: true } } },
  });

  const serialized = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    articleType: a.articleType,
    status: a.status,
    summary: a.summary,
    bodyMd: a.bodyMd,
    faqMd: a.faqMd,
    affiliateDisclosureEnabled: a.affiliateDisclosureEnabled,
    projectName: a.project?.name || null,
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">검수 대기</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          검수 대기 중인 글 {serialized.length}건
        </p>
      </div>
      <ReviewList articles={serialized} />
    </div>
  );
}
