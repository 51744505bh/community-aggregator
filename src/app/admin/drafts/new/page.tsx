import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ArticleEditor from "@/components/admin/article-editor";

export const metadata: Metadata = {
  title: "새 글 작성 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function NewArticlePage() {
  await requireAdmin();

  const projects = await prisma.project.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">새 글 작성</h1>
      <ArticleEditor projects={projects} />
    </div>
  );
}
