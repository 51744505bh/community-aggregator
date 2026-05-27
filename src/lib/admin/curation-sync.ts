"use server";

import { prisma } from "@/lib/prisma";
import type { Post } from "@/lib/posts";

const MAX_SYNC_POSTS = 180;

type CuratedCandidateDelegate = {
  createMany: (args: {
    data: Array<{
      postId: string;
      status: "PENDING";
    }>;
    skipDuplicates: true;
  }) => Promise<{ count: number }>;
};

function getCuratedDelegate(): CuratedCandidateDelegate | undefined {
  return (prisma as typeof prisma & { curatedPost?: CuratedCandidateDelegate }).curatedPost;
}

export async function syncCurationCandidates(posts: Post[]) {
  const curatedPost = getCuratedDelegate();
  if (!curatedPost || posts.length === 0) return;

  const postIds = Array.from(new Set(posts.map((post) => post.id))).slice(0, MAX_SYNC_POSTS);
  if (postIds.length === 0) return;

  try {
    await curatedPost.createMany({
      data: postIds.map((postId) => ({
        postId,
        status: "PENDING",
      })),
      skipDuplicates: true,
    });
  } catch {
    // The inbox should still work from posts.json if the curation table is unavailable.
  }
}
