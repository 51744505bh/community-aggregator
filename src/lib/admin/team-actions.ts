"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { logAdminEvent } from "@/lib/audit/log-admin-event";
import type { AdminRole, AdminStatus } from "@/generated/prisma/client";
import crypto from "crypto";

/**
 * 팀원 역할 변경 (OWNER only)
 */
export async function changeUserRole(targetUserId: string, newRole: AdminRole) {
  const actor = await requireRole(["OWNER"]);

  const target = await prisma.adminUser.findUnique({
    where: { id: targetUserId },
  });
  if (!target) throw new Error("사용자를 찾을 수 없습니다.");

  // 자기 자신의 OWNER 역할 변경 방지
  if (target.id === actor.id && target.role === "OWNER" && newRole !== "OWNER") {
    // 다른 OWNER가 있는지 확인
    const otherOwners = await prisma.adminUser.count({
      where: { role: "OWNER", status: "ACTIVE", id: { not: actor.id } },
    });
    if (otherOwners === 0) {
      throw new Error("마지막 OWNER의 역할을 변경할 수 없습니다.");
    }
  }

  const oldRole = target.role;
  await prisma.adminUser.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "user_role_changed",
    targetType: "AdminUser",
    targetId: targetUserId,
    metadata: { email: target.email, oldRole, newRole },
  });
}

/**
 * 팀원 상태 변경 (OWNER only)
 */
export async function changeUserStatus(targetUserId: string, newStatus: AdminStatus) {
  const actor = await requireRole(["OWNER"]);

  const target = await prisma.adminUser.findUnique({
    where: { id: targetUserId },
  });
  if (!target) throw new Error("사용자를 찾을 수 없습니다.");

  // OWNER 비활성화 방지 (마지막 OWNER)
  if (target.role === "OWNER" && newStatus !== "ACTIVE") {
    const otherOwners = await prisma.adminUser.count({
      where: { role: "OWNER", status: "ACTIVE", id: { not: target.id } },
    });
    if (otherOwners === 0) {
      throw new Error("마지막 OWNER를 비활성화할 수 없습니다.");
    }
  }

  const oldStatus = target.status;
  await prisma.adminUser.update({
    where: { id: targetUserId },
    data: { status: newStatus },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "user_status_changed",
    targetType: "AdminUser",
    targetId: targetUserId,
    metadata: { email: target.email, oldStatus, newStatus },
  });
}

/**
 * 초대 생성 (OWNER only)
 * 초대 토큰을 반환. 이 토큰을 포함한 URL을 수동으로 전달.
 */
export async function createInvite(email: string, role: AdminRole, expiresInDays: number = 7) {
  const actor = await requireRole(["OWNER"]);

  const normalizedEmail = email.toLowerCase().trim();

  // 이미 존재하는 사용자 확인
  const existing = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new Error("이미 등록된 이메일입니다.");
  }

  // 토큰 생성 + 해시
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await prisma.adminInvite.create({
    data: {
      email: normalizedEmail,
      role,
      tokenHash,
      invitedByUserId: actor.id,
      expiresAt,
    },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "invite_created",
    targetType: "AdminInvite",
    metadata: { email: normalizedEmail, role, expiresInDays },
  });

  return { token, email: normalizedEmail, expiresAt };
}

/**
 * 직접 팀원 추가 (allowlist 방식, OWNER only)
 */
export async function addTeamMember(email: string, role: AdminRole) {
  const actor = await requireRole(["OWNER"]);

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new Error("이미 등록된 이메일입니다.");
  }

  const newUser = await prisma.adminUser.create({
    data: {
      email: normalizedEmail,
      role,
      status: "ACTIVE",
      authProvider: "google",
    },
  });

  await logAdminEvent({
    actorUserId: actor.id,
    action: "user_added",
    targetType: "AdminUser",
    targetId: newUser.id,
    metadata: { email: normalizedEmail, role },
  });
}
