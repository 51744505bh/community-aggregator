import Link from "next/link";

const PER_PAGE = 10;

export function paginate<T>(items: T[], page: number): { items: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PER_PAGE;
  return { items: items.slice(start, start + PER_PAGE), totalPages };
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const sep = basePath.includes("?") ? "&" : "?";

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={`${basePath}${sep}page=${currentPage - 1}`}
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          이전
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-2 py-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={`${basePath}${sep}page=${p}`}
            className={`rounded border px-3 py-2 text-sm ${
              p === currentPage
                ? "border-gray-900 bg-gray-900 font-bold text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}${sep}page=${currentPage + 1}`}
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          다음
        </Link>
      )}
    </div>
  );
}
