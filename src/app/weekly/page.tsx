import { getPostsByPeriod } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";
import Pagination, { paginate } from "@/components/Pagination";

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const allPosts = getPostsByPeriod("weekly");
  const { items: posts, totalPages } = paginate(allPosts, currentPage);

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">주간 베스트</h1>
      <AdBanner type="adsense" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            아직 수집된 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/weekly" />
      <AdBanner type="coupang" />
    </>
  );
}
