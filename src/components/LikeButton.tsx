"use client";

import { useEffect, useState } from "react";

export default function LikeButton({ postId }: { postId: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const localLiked = localStorage.getItem(`liked_${postId}`) === "1";
    if (localLiked) setLiked(true);

    fetch(`/api/likes/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        setCount(d.count);
        setLiked(d.liked);
        if (d.liked) {
          localStorage.setItem(`liked_${postId}`, "1");
        } else {
          localStorage.removeItem(`liked_${postId}`);
        }
        setInitialized(true);
      })
      .catch(() => setInitialized(true));
  }, [postId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/likes/${postId}`, { method: "POST" });
      const data = await res.json();
      setCount(data.count);
      setLiked(data.liked);
      if (data.liked) {
        localStorage.setItem(`liked_${postId}`, "1");
      } else {
        localStorage.removeItem(`liked_${postId}`);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) return null;

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        liked
          ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
      } disabled:opacity-50`}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span>{count > 0 ? count.toLocaleString() : "좋아요"}</span>
    </button>
  );
}
