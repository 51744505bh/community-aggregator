import { getPostsByCategory, getSafePosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import Pagination, { paginate } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "유머 - 커뮤니티 웃긴 글 모음 | Dripszone",
  description: "커뮤니티에서 화제가 된 유머 게시물을 정리합니다. 웃기면서도 공감 가는 이야기를 만나보세요.",
  robots: { index: true, follow: true },
};

export default async function HumorPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = getSafePosts(getPostsByCategory("humor"));
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">유머</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          커뮤니티에서 화제가 된 웃긴 글과 공감 유머를 모았습니다.
        </p>
      </div>
      <AdBanner type="adsense" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            수집된 유머 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/humor" />
    </>
  );
}
