"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-role";
import { logAdminEvent } from "@/lib/audit/log-admin-event";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CURATOR_NAME, type CuratedBucket } from "@/lib/curation";

export type CuratedBucketInput = CuratedBucket;

function getCuratedDelegate() {
  return (prisma as typeof prisma & {
    curatedPost?: {
      findUnique: (args: { where: { postId: string } }) => Promise<{
        id: string;
        postId: string;
        status: "PENDING" | "APPROVED" | "HIDDEN";
        bucket: CuratedBucket | null;
        rank: number | null;
        curatorName: string | null;
      } | null>;
      count: (args: { where: { status: "APPROVED"; bucket: CuratedBucketInput } }) => Promise<number>;
      update: (args: {
        where: { postId: string };
        data: Record<string, unknown>;
      }) => Promise<{ id: string }>;
      create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
      delete: (args: { where: { postId: string } }) => Promise<void>;
    };
  }).curatedPost;
}

function missingTableError() {
  return new Error("큐레이션 테이블이 아직 준비되지 않았습니다. `npx prisma db push`가 먼저 필요합니다.");
}

function rethrowCurationError(error: unknown): never {
  if (error instanceof Error) {
    const message = error.message || "";
    if (
      message.includes("curated_posts") ||
      message.includes("CuratedPost") ||
      message.includes("custom_category") ||
      message.includes("customCategory")
    ) {
      throw error;
    }
  }

  throw missingTableError();
}

function revalidateCurationPaths() {
  revalidatePath("/admin/inbox");
  revalidatePath("/issue");
  revalidatePath("/humor");
  revalidatePath("/info");
  revalidatePath("/");
  revalidatePath("/best_24h");
  revalidatePath("/best_weekly");
  revalidatePath("/best_monthly");
  revalidatePath("/best/24h");
  revalidatePath("/best/weekly");
  revalidatePath("/best/monthly");
}

export async function assignCuratedPost(postId: string, bucket: CuratedBucketInput) {
  const actor = await requireAdmin();
  const curatedPost = getCuratedDelegate();
  if (!curatedPost) throw missingTableError();

  try {
    const existing = await curatedPost.findUnique({
      where: { postId },
    });

    const nextRank =
      (await curatedPost.count({
        where: { status: "APPROVED", bucket },
      })) + 1;

    const record = existing
      ? await curatedPost.update({
          where: { postId },
          data: {
            status: "APPROVED",
            bucket,
            pickedByUserId: actor.id,
            curatorName: DEFAULT_CURATOR_NAME,
            rank: existing.bucket === bucket && existing.rank ? existing.rank : nextRank,
          },
        })
      : await curatedPost.create({
          data: {
            postId,
            status: "APPROVED",
            bucket,
            pickedByUserId: actor.id,
            curatorName: DEFAULT_CURATOR_NAME,
            rank: nextRank,
          },
        });

    await logAdminEvent({
      actorUserId: actor.id,
      action: "curation_assigned",
      targetType: "CuratedPost",
      targetId: record.id,
      metadata: { postId, bucket },
    });

    revalidateCurationPaths();
  } catch (error) {
    rethrowCurationError(error);
  }
}

export async function saveCuratedPostDraft(
  postId: string,
  data: {
    curatorName?: string;
    customCategory?: string;
    customTitle?: string;
    customSummary?: string;
    customBodyMd?: string;
    cachedViewCount?: number | null;
  }
) {
  const actor = await requireAdmin();
  const curatedPost = getCuratedDelegate();
  if (!curatedPost) throw missingTableError();

  try {
    const existing = await curatedPost.findUnique({
      where: { postId },
    });

    const payload = {
      curatorName: data.curatorName?.trim() || existing?.curatorName || DEFAULT_CURATOR_NAME,
      customCategory: data.customCategory?.trim() || null,
      customTitle: data.customTitle?.trim() || null,
      customSummary: data.customSummary?.trim() || null,
      customBodyMd: data.customBodyMd?.trim() || null,
      cachedViewCount: data.cachedViewCount ?? null,
      pickedByUserId: actor.id,
      status: existing?.bucket ? "APPROVED" : existing?.status || "PENDING",
    };

    const record = existing
      ? await curatedPost.update({
          where: { postId },
          data: payload,
        })
      : await curatedPost.create({
          data: {
            postId,
            ...payload,
          },
        });

    await logAdminEvent({
      actorUserId: actor.id,
      action: "curation_draft_saved",
      targetType: "CuratedPost",
      targetId: record.id,
      metadata: { postId },
    });

    revalidateCurationPaths();
  } catch (error) {
    rethrowCurationError(error);
  }
}

export async function moveCuratedPostCategory(postId: string, category: string) {
  const actor = await requireAdmin();
  const curatedPost = getCuratedDelegate();
  if (!curatedPost) throw missingTableError();

  try {
    const existing = await curatedPost.findUnique({
      where: { postId },
    });

    const record = existing
      ? await curatedPost.update({
          where: { postId },
          data: {
            customCategory: category,
            note: `manual-category:${category}`,
            pickedByUserId: actor.id,
            curatorName: existing.curatorName || DEFAULT_CURATOR_NAME,
            status: "APPROVED",
          },
        })
      : await curatedPost.create({
          data: {
            postId,
            customCategory: category,
            note: `manual-category:${category}`,
            pickedByUserId: actor.id,
            curatorName: DEFAULT_CURATOR_NAME,
            status: "APPROVED",
          },
        });

    await logAdminEvent({
      actorUserId: actor.id,
      action: "curation_category_moved",
      targetType: "CuratedPost",
      targetId: record.id,
      metadata: { postId, category },
    });

    revalidateCurationPaths();
  } catch (error) {
    rethrowCurationError(error);
  }
}

export async function hideCuratedPost(postId: string) {
  const actor = await requireAdmin();
  const curatedPost = getCuratedDelegate();
  if (!curatedPost) throw missingTableError();

  try {
    const existing = await curatedPost.findUnique({
      where: { postId },
    });

    const record = existing
      ? await curatedPost.update({
          where: { postId },
          data: {
            status: "HIDDEN",
            bucket: null,
            rank: null,
            pickedByUserId: actor.id,
          },
        })
      : await curatedPost.create({
          data: {
            postId,
            status: "HIDDEN",
            pickedByUserId: actor.id,
            curatorName: DEFAULT_CURATOR_NAME,
          },
        });

    await logAdminEvent({
      actorUserId: actor.id,
      action: "curation_hidden",
      targetType: "CuratedPost",
      targetId: record.id,
      metadata: { postId },
    });

    revalidateCurationPaths();
  } catch (error) {
    rethrowCurationError(error);
  }
}

export async function resetCuratedPost(postId: string) {
  const actor = await requireAdmin();
  const curatedPost = getCuratedDelegate();
  if (!curatedPost) throw missingTableError();

  try {
    const existing = await curatedPost.findUnique({
      where: { postId },
    });

    if (!existing) return;

    await curatedPost.delete({
      where: { postId },
    });

    await logAdminEvent({
      actorUserId: actor.id,
      action: "curation_reset",
      targetType: "CuratedPost",
      targetId: existing.id,
      metadata: { postId },
    });

    revalidateCurationPaths();
  } catch (error) {
    rethrowCurationError(error);
  }
}
