import { auth } from "./auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/generated/prisma/client";

export interface AdminUserInfo {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  status: string;
}

/**
 * 현재 세션의 admin 사용자를 DB에서 재조회하여 검증.
 * 세션만 신뢰하지 않고 반드시 DB 재검사.
 */
async function getVerifiedAdminUser(): Promise<AdminUserInfo | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!adminUser) return null;
  if (adminUser.status !== "ACTIVE") return null;
  if (!adminUser.role) return null;

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    status: adminUser.status,
  };
}

/**
 * /admin 접근 가능한 ACTIVE admin 사용자인지 확인.
 * 실패 시 /admin/denied로 리다이렉트.
 */
export async function requireAdmin(): Promise<AdminUserInfo> {
  const user = await getVerifiedAdminUser();
  if (!user) redirect("/admin/denied");
  return user;
}

/**
 * 특정 역할을 가진 admin 사용자인지 확인.
 * 실패 시 /admin/denied로 리다이렉트.
 */
export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminUserInfo> {
  const user = await requireAdmin();
  if (!allowedRoles.includes(user.role)) redirect("/admin/denied");
  return user;
}

/**
 * API 라우트/서버 액션용: 역할 검증 후 user 반환. 실패 시 null 반환.
 */
export async function checkRole(allowedRoles: AdminRole[]): Promise<AdminUserInfo | null> {
  const user = await getVerifiedAdminUser();
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}
