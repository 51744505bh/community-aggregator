import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import Pagination, { paginate } from "@/components/Pagination";
import { getCuratedFeed } from "@/lib/curation";

export const metadata: Metadata = {
  title: "24시간 베스트 - Dripszone",
  description: "최근 24시간 기준으로 빠르게 모은 커뮤니티 베스트 피드입니다.",
};

export default async function DailyBestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = await getCuratedFeed("BEST_24H", 100);
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <section className="space-y-5">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-[30px] font-extrabold tracking-tight text-gray-900 dark:text-white">24시간 베스트</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          최근 24시간 동안 커뮤니티에서 주목받은 게시글입니다.
        </p>
      </header>
      <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            아직 수집된 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/best_24h" />
    </section>
  );
}
