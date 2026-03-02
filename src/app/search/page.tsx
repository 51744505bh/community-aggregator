import { searchPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const posts = query ? searchPosts(query) : [];

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        검색 결과
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        &ldquo;{query}&rdquo; {posts.length > 0 ? `${posts.length}개` : ""}
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
    </>
  );
}
