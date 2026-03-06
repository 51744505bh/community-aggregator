import { getPostsByCategory, getSafePosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import Pagination, { paginate } from "@/components/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이슈 해설 - 지금 화제인 이슈 정리 | Dripszone",
  description: "지금 커뮤니티에서 뜨거운 이슈를 빠르게 정리하고 맥락을 설명합니다.",
  robots: { index: true, follow: true },
};

export default async function IssuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = getSafePosts(getPostsByCategory("issue"));
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">이슈 해설</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          지금 화제가 되고 있는 이슈의 배경과 맥락을 정리합니다.
        </p>
      </div>
      <AdBanner type="adsense" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            수집된 이슈 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/issue" />
    </>
  );
}
