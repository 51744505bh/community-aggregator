import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import TeamManagement from "@/components/admin/team-management";

export const metadata: Metadata = {
  title: "팀 관리 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminTeamPage() {
  await requireRole(["OWNER"]);

  const [members, invites] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.adminInvite.findMany({
      orderBy: { createdAt: "desc" },
      include: { invitedBy: { select: { email: true } } },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          팀 관리
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          팀원 역할 및 상태 관리 · 새 팀원 추가
        </p>
      </div>

      <TeamManagement
        members={members.map((m) => ({
          id: m.id,
          email: m.email,
          name: m.name,
          role: m.role,
          status: m.status,
          lastLoginAt: m.lastLoginAt?.toISOString() ?? null,
          createdAt: m.createdAt.toISOString(),
        }))}
        invites={invites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          expiresAt: inv.expiresAt.toISOString(),
          usedAt: inv.usedAt?.toISOString() ?? null,
          invitedByEmail: inv.invitedBy.email,
          createdAt: inv.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
