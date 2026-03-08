"use server";

import { requireRole, requireAdmin } from "@/lib/auth/require-role";
import { logAdminEvent } from "@/lib/audit/log-admin-event";
import { prisma } from "@/lib/prisma";
import type { ArticleType, ArticleStatus } from "@/generated/prisma/client";

export async function createProject(name: string, slug: string, description?: string) {
  const actor = await requireRole(["OWNER", "MANAGING_EDITOR"]);
  const normalized = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

  const existing = await prisma.project.findUnique({ where: { slug: normalized } });
  if (existing) throw new Error("이미 존재하는 슬러그입니다.");

  const project = await prisma.project.create({
    data: { name: name.trim(), slug: normalized, description: description?.trim() || null },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "project_created",
    targetType: "Project",
    targetId: project.id,
    metadata: { name, slug: normalized },
  });

  return project;
}

export async function createArticle(data: {
  title: string;
  slug: string;
  articleType: ArticleType;
  projectId?: string;
  summary?: string;
  bodyMd: string;
  faqMd?: string;
  seoTitle?: string;
  metaDescription?: string;
  affiliateDisclosureEnabled?: boolean;
}) {
  const actor = await requireAdmin();
  const normalized = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

  const existing = await prisma.article.findUnique({ where: { slug: normalized } });
  if (existing) throw new Error("이미 존재하는 슬러그입니다.");

  const article = await prisma.article.create({
    data: {
      title: data.title.trim(),
      slug: normalized,
      articleType: data.articleType,
      projectId: data.projectId || null,
      summary: data.summary?.trim() || null,
      bodyMd: data.bodyMd,
      faqMd: data.faqMd || null,
      seoTitle: data.seoTitle?.trim() || null,
      metaDescription: data.metaDescription?.trim() || null,
      affiliateDisclosureEnabled: data.affiliateDisclosureEnabled || false,
      authorUserId: actor.id,
      status: "DRAFT",
    },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "draft_created",
    targetType: "Article",
    targetId: article.id,
    metadata: { title: data.title, slug: normalized },
  });

  return article;
}

export async function updateArticle(articleId: string, data: {
  title?: string;
  slug?: string;
  articleType?: ArticleType;
  projectId?: string | null;
  summary?: string;
  bodyMd?: string;
  faqMd?: string;
  seoTitle?: string;
  metaDescription?: string;
  affiliateDisclosureEnabled?: boolean;
  status?: ArticleStatus;
}) {
  const actor = await requireAdmin();

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("글을 찾을 수 없습니다.");

  if (data.slug && data.slug !== article.slug) {
    const normalized = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
    const existing = await prisma.article.findUnique({ where: { slug: normalized } });
    if (existing) throw new Error("이미 존재하는 슬러그입니다.");
    data.slug = normalized;
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.articleType !== undefined && { articleType: data.articleType }),
      ...(data.projectId !== undefined && { projectId: data.projectId }),
      ...(data.summary !== undefined && { summary: data.summary.trim() || null }),
      ...(data.bodyMd !== undefined && { bodyMd: data.bodyMd }),
      ...(data.faqMd !== undefined && { faqMd: data.faqMd || null }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle.trim() || null }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription.trim() || null }),
      ...(data.affiliateDisclosureEnabled !== undefined && { affiliateDisclosureEnabled: data.affiliateDisclosureEnabled }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "draft_updated",
    targetType: "Article",
    targetId: articleId,
    metadata: { changes: Object.keys(data) },
  });

  return updated;
}

export async function submitForReview(articleId: string) {
  const actor = await requireAdmin();
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("글을 찾을 수 없습니다.");

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "READY_TO_REVIEW" },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "review_submitted",
    targetType: "Article",
    targetId: articleId,
  });
}

export async function approveArticle(articleId: string) {
  const actor = await requireRole(["OWNER", "MANAGING_EDITOR", "REVIEWER"]);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("글을 찾을 수 없습니다.");

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "READY_TO_PUBLISH", reviewerUserId: actor.id },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "review_approved",
    targetType: "Article",
    targetId: articleId,
  });
}

export async function rejectArticle(articleId: string) {
  const actor = await requireRole(["OWNER", "MANAGING_EDITOR", "REVIEWER"]);

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "NEEDS_EDIT" },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "review_rejected",
    targetType: "Article",
    targetId: articleId,
  });
}

export async function publishArticle(articleId: string) {
  const actor = await requireRole(["OWNER", "MANAGING_EDITOR"]);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("글을 찾을 수 없습니다.");

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "publish_approved",
    targetType: "Article",
    targetId: articleId,
    metadata: { title: article.title, slug: article.slug },
  });
}

export async function unpublishArticle(articleId: string) {
  const actor = await requireRole(["OWNER", "MANAGING_EDITOR"]);

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "DRAFT", publishedAt: null },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "publish_reverted",
    targetType: "Article",
    targetId: articleId,
  });
}

export async function deleteArticle(articleId: string) {
  const actor = await requireRole(["OWNER", "MANAGING_EDITOR"]);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error("글을 찾을 수 없습니다.");

  await prisma.article.delete({ where: { id: articleId } });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "article_deleted",
    targetType: "Article",
    targetId: articleId,
    metadata: { title: article.title },
  });
}
