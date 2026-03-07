import { signOut } from "@/lib/auth/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "접근 거부 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default function AdminDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-2xl font-bold">!</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-2">접근 권한 없음</h1>
        <p className="text-gray-400 text-sm mb-6">
          승인되지 않은 계정입니다. 운영자에게 등록을 요청하세요.
        </p>

        <div className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="w-full bg-gray-700 text-white py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              다른 계정으로 로그인
            </button>
          </form>

          <Link
            href="/"
            className="block w-full bg-gray-700/50 text-gray-400 py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
