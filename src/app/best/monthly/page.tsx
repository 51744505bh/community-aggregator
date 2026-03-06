import { getPostsByPeriod } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Pagination, { paginate } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "월간 베스트 - Dripszone",
  description: "이번 달 커뮤니티에서 가장 인기 있었던 게시물 모음입니다.",
};

export default async function MonthlyBestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = getPostsByPeriod("monthly");
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">월간 베스트</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            아직 수집된 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/best/monthly" />
    </>
  );
}
