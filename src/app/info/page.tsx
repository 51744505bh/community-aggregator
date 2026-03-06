import { getPostsByCategory, getInfoSafePosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import Pagination, { paginate } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "정보/꿀팁 - 실생활에 유용한 정보 모음 | Dripszone",
  description: "커뮤니티에서 공유된 실생활 꿀팁, 유용한 정보, 생활 노하우를 정리합니다.",
  robots: { index: true, follow: true },
};

export default async function InfoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = getInfoSafePosts(getPostsByCategory("info"));
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">정보/꿀팁</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          실생활에 바로 쓸 수 있는 유용한 정보와 꿀팁을 모았습니다.
        </p>
      </div>
      <AdBanner type="adsense" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            수집된 정보 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/info" />
    </>
  );
}
