"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

const navItems = [
  { label: "24시간 피드 베스트", href: "/best_24h" },
  { label: "주간 피드 베스트", href: "/best_weekly" },
  { label: "월간 피드 베스트", href: "/best_monthly" },
  { label: "이슈", href: "/issue" },
  { label: "유머", href: "/humor" },
  { label: "정보/꿀팁", href: "/info" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-[2rem] font-black tracking-tight text-gray-900">
              DRIPSZONE
            </Link>
            <p className="mt-1 text-xs text-gray-500">국내 커뮤니티 베스트 피드</p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="h-10 flex-1 rounded border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900"
            />
            <button
              type="submit"
              className="h-10 rounded bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              검색
            </button>
          </form>
        </div>

        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-3 text-sm">
          <Link
            href="/"
            className={`font-medium transition-colors ${
              pathname === "/" ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            홈
          </Link>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
