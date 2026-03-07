import { requireAdmin } from "@/lib/auth/require-role";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검수 대기 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminReviewPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          검수 대기
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          검수 대기 중인 기사 목록
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          검수 기능이 곧 추가됩니다.
        </p>
      </div>
    </div>
  );
}
