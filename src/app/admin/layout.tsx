import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 로그인/거부 페이지는 사이드바 없이 렌더
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    );
  }

  // DB에서 admin 사용자 재확인
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  const isApproved = adminUser?.status === "ACTIVE" && adminUser?.role;

  // 승인되지 않은 사용자: 사이드바 없이 children (denied 페이지가 렌더될 것)
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar
        userEmail={adminUser.email}
        userRole={adminUser.role!}
      />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
