import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "감사 로그 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole(["OWNER", "MANAGING_EDITOR", "REVIEWER"]);

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const perPage = 30;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true } } },
    }),
    prisma.adminAuditLog.count(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const ACTION_LABELS: Record<string, string> = {
    login_success: "로그인 성공",
    login_denied_not_allowlisted: "로그인 거부 (미등록)",
    login_denied_inactive: "로그인 거부 (비활성)",
    invite_created: "초대 생성",
    invite_used: "초대 사용",
    user_role_changed: "역할 변경",
    user_status_changed: "상태 변경",
    user_added: "팀원 추가",
    draft_created: "초안 생성",
    draft_updated: "초안 수정",
    review_submitted: "검수 제출",
    publish_approved: "발행 승인",
    publish_reverted: "발행 철회",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          감사 로그
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          총 {total}건의 활동 기록
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="px-5 py-3 font-medium">시간</th>
                <th className="px-5 py-3 font-medium">작업자</th>
                <th className="px-5 py-3 font-medium">액션</th>
                <th className="px-5 py-3 font-medium">대상</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-5 py-3 text-gray-900 dark:text-white">
                    {log.actor?.email ?? (
                      <span className="text-gray-400">시스템</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {log.targetType && (
                      <span>
                        {log.targetType}
                        {log.targetId && (
                          <span className="text-gray-400 ml-1">
                            #{log.targetId.slice(0, 8)}
                          </span>
                        )}
                      </span>
                    )}
                    {log.metadata && typeof log.metadata === "object" && (
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {JSON.stringify(log.metadata).slice(0, 80)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">
                    {log.ipAddress ?? "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-gray-400"
                  >
                    감사 로그가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {page} / {totalPages} 페이지
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/admin/audit?page=${page - 1}`}
                  className="text-xs px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  이전
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/admin/audit?page=${page + 1}`}
                  className="text-xs px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  다음
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
