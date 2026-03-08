import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import PublishList from "@/components/admin/publish-list";

export const metadata: Metadata = {
  title: "발행 관리 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminPublishPage() {
  await requireRole(["OWNER", "MANAGING_EDITOR"]);

  const [readyArticles, publishedArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "READY_TO_PUBLISH" },
      orderBy: { updatedAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { project: { select: { name: true } } },
    }),
  ]);

  const serializeList = (list: typeof readyArticles) =>
    list.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      articleType: a.articleType,
      projectName: a.project?.name || null,
      publishedAt: a.publishedAt?.toISOString() || null,
      updatedAt: a.updatedAt.toISOString(),
    }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">발행 관리</h1>
      </div>
      <PublishList
        readyArticles={serializeList(readyArticles)}
        publishedArticles={serializeList(publishedArticles)}
      />
    </div>
  );
}
