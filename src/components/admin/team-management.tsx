"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  changeUserRole,
  changeUserStatus,
  addTeamMember,
} from "@/lib/admin/team-actions";

const ROLES = ["OWNER", "MANAGING_EDITOR", "EDITOR", "REVIEWER", "AD_MANAGER"] as const;
const STATUSES = ["ACTIVE", "SUSPENDED", "REVOKED"] as const;

const ROLE_LABELS: Record<string, string> = {
  OWNER: "오너",
  MANAGING_EDITOR: "편집장",
  EDITOR: "에디터",
  REVIEWER: "검수자",
  AD_MANAGER: "광고 관리",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "대기",
  ACTIVE: "활성",
  SUSPENDED: "정지",
  REVOKED: "해지",
};

interface Member {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  usedAt: string | null;
  invitedByEmail: string;
  createdAt: string;
}

interface Props {
  members: Member[];
  invites: Invite[];
}

export default function TeamManagement({ members, invites }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<string>("EDITOR");

  function handleRoleChange(userId: string, role: string) {
    setError(null);
    startTransition(async () => {
      try {
        await changeUserRole(userId, role as typeof ROLES[number]);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "역할 변경 실패");
      }
    });
  }

  function handleStatusChange(userId: string, status: string) {
    setError(null);
    startTransition(async () => {
      try {
        await changeUserStatus(userId, status as typeof STATUSES[number]);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "상태 변경 실패");
      }
    });
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await addTeamMember(newEmail, newRole as typeof ROLES[number]);
        setNewEmail("");
        setShowAddForm(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "팀원 추가 실패");
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 팀원 목록 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            팀원 ({members.length})
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? "취소" : "+ 팀원 추가"}
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3 items-end"
          >
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                역할
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              추가
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-2 font-medium">이메일</th>
                <th className="px-5 py-2 font-medium">역할</th>
                <th className="px-5 py-2 font-medium">상태</th>
                <th className="px-5 py-2 font-medium">최근 로그인</th>
                <th className="px-5 py-2 font-medium">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-3">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {member.email}
                    </div>
                    {member.name && (
                      <div className="text-xs text-gray-500">{member.name}</div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={member.role ?? ""}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={isPending}
                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={member.status}
                      onChange={(e) =>
                        handleStatusChange(member.id, e.target.value)
                      }
                      disabled={isPending}
                      className={`text-xs px-2 py-1 border rounded disabled:opacity-50 ${
                        member.status === "ACTIVE"
                          ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : member.status === "SUSPENDED"
                            ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                            : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {member.lastLoginAt
                      ? new Date(member.lastLoginAt).toLocaleString("ko-KR")
                      : "-"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(member.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 초대 목록 */}
      {invites.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              초대 기록
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-2 font-medium">이메일</th>
                  <th className="px-5 py-2 font-medium">역할</th>
                  <th className="px-5 py-2 font-medium">초대자</th>
                  <th className="px-5 py-2 font-medium">만료</th>
                  <th className="px-5 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {invites.map((inv) => {
                  const expired = new Date(inv.expiresAt) < new Date();
                  return (
                    <tr key={inv.id}>
                      <td className="px-5 py-3 text-gray-900 dark:text-white">
                        {inv.email}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                        {ROLE_LABELS[inv.role] ?? inv.role}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {inv.invitedByEmail}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {new Date(inv.expiresAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-5 py-3">
                        {inv.usedAt ? (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            사용됨
                          </span>
                        ) : expired ? (
                          <span className="text-xs text-red-500">만료</span>
                        ) : (
                          <span className="text-xs text-blue-500">대기 중</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
