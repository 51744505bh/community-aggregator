"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "H" },
  { href: "/admin/projects", label: "프로젝트", icon: "P", ownerOnly: true },
  { href: "/admin/inbox", label: "수집함", icon: "I" },
  { href: "/admin/briefs", label: "브리프", icon: "B" },
  { href: "/admin/drafts", label: "초안", icon: "D" },
  { href: "/admin/review", label: "검수", icon: "R" },
  { href: "/admin/publish", label: "발행", icon: ">" },
  { href: "/admin/team", label: "팀 관리", icon: "T", ownerOnly: true },
  { href: "/admin/audit", label: "감사 로그", icon: "L" },
  { href: "/admin/settings", label: "설정", icon: "S", ownerOnly: true },
] as const;

interface AdminSidebarProps {
  userEmail: string;
  userRole: string;
}

export default function AdminSidebar({ userEmail, userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if ("ownerOnly" in item && item.ownerOnly) {
      return userRole === "OWNER";
    }
    return true;
  });

  return (
    <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <Link href="/" className="text-white font-bold text-lg">
          Dripszone
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">편집실</p>
      </div>

      <nav className="flex-1 py-2">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-gray-800 text-white border-r-2 border-blue-500"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        <p className="text-[10px] text-gray-600 mt-0.5">{userRole}</p>
      </div>
    </aside>
  );
}
