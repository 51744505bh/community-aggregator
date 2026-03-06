import { redirect } from "next/navigation";
import { parsePostId } from "@/lib/posts";

export default async function PostRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { source, rawId } = parsePostId(id);
  redirect(`/community/${source}/${rawId}`);
}
