import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ProjectManagement from "@/components/admin/project-management";

export const metadata: Metadata = {
  title: "프로젝트 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminProjectsPage() {
  await requireRole(["OWNER", "MANAGING_EDITOR"]);

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { articles: true } } },
  });

  const serialized = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    status: p.status,
    articleCount: p._count.articles,
    createdAt: p.createdAt.toISOString(),
  }));

  return <ProjectManagement projects={serialized} />;
}
