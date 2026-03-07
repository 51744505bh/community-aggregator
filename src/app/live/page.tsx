import { getMixedRecentPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Pagination, { paginate } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "실시간 커뮤니티 트렌드 - Dripszone",
  description: "국내 주요 커뮤니티에서 지금 화제가 되고 있는 게시물을 실시간으로 확인하세요.",
  robots: { index: false, follow: true },
};

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = getMixedRecentPosts(100);
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">실시간 커뮤니티 트렌드</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          지금 커뮤니티에서 뜨고 있는 글을 한눈에 확인하세요.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            아직 수집된 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/live" />
    </>
  );
}
