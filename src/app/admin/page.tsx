import { requireAdmin } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const user = await requireAdmin();

  const [teamCount, auditCount] = await Promise.all([
    prisma.adminUser.count({ where: { status: "ACTIVE" } }),
    prisma.adminAuditLog.count(),
  ]);

  const recentLogs = await prisma.adminAuditLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { email: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          편집실 대시보드
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {user.email} / {user.role}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">활성 팀원</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {teamCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">감사 로그</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {auditCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">내 역할</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {user.role}
          </p>
        </div>
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { href: "/admin/inbox", label: "수집함" },
          { href: "/admin/drafts", label: "초안 관리" },
          { href: "/admin/review", label: "검수 대기" },
          { href: "/admin/publish", label: "발행 관리" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-center"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* 최근 활동 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            최근 활동
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentLogs.map((log) => (
            <div key={log.id} className="px-5 py-3 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {log.action}
                </span>
                {log.actor && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {log.actor.email}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(log.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              아직 활동 로그가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
