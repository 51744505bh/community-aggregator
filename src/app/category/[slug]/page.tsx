import { getPostsByCategory, categoryMap } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import AdBanner from "@/components/AdBanner";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = getPostsByCategory(slug);
  const categoryName = categoryMap[slug] || slug;

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{categoryName}</h1>
      <AdBanner type="adsense" />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            해당 카테고리에 수집된 게시글이 없습니다.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <AdBanner type="coupang" />
    </>
  );
}
