import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-role";
import { getCuratedDecision, DEFAULT_CURATOR_NAME } from "@/lib/curation";
import { getPostById } from "@/lib/posts";
import CurationEditor from "@/components/admin/curation-editor";

export const metadata: Metadata = {
  title: "큐레이션 수정 - Dripszone 편집실",
  robots: { index: false, follow: false },
};

export default async function AdminCurationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const post = getPostById(id);

  if (!post) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <h1 className="text-xl font-bold text-gray-900">게시글을 찾을 수 없습니다.</h1>
        <Link href="/admin/inbox" className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
          수집함으로 돌아가기
        </Link>
      </div>
    );
  }

  const decision = await getCuratedDecision(id);

  return (
    <CurationEditor
      data={{
        postId: id,
        originalUrl: post.url,
        originalTitle: post.title,
        originalSummary: post.summary || "",
        originalBody: post.content || "",
        initialCuratorName: decision?.curatorName || DEFAULT_CURATOR_NAME,
        initialCategory: decision?.customCategory || "",
        initialTitle: decision?.customTitle || "",
        initialSummary: decision?.customSummary || "",
        initialBody: decision?.customBodyMd || "",
        initialCachedViewCount: decision?.cachedViewCount ?? 0,
        status: decision?.status || "UNREVIEWED",
      }}
    />
  );
}
