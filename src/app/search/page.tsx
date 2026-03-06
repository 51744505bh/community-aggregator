import { searchPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Pagination, { paginate } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색 - Dripszone",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = q || "";
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = query ? searchPosts(query) : [];
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        검색 결과
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        &ldquo;{query}&rdquo; {allPosts.length > 0 ? `${allPosts.length}개` : ""}
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {query ? "검색 결과가 없습니다." : "검색어를 입력해주세요."}
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/search?q=${encodeURIComponent(query)}`} />
    </>
  );
}
