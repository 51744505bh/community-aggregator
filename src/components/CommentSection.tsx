"use client";

import { useEffect, useState, useCallback } from "react";

interface Comment {
  id: number;
  nickname: string;
  content: string;
  created_at: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments/${postId}?page=${pageNum}`);
        const data = await res.json();
        if (append) {
          setComments((prev) => [...prev, ...data.comments]);
        } else {
          setComments(data.comments);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      setError("댓글은 500자까지 입력 가능합니다.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim() || "익명",
          content: trimmed,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "댓글 작성에 실패했습니다.");
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setTotal((prev) => prev + 1);
      setContent("");
    } catch {
      setError("댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
        댓글{" "}
        {total > 0 && (
          <span className="text-sm font-normal text-gray-500">({total})</span>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            maxLength={20}
            className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요..."
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{content.length}/500</span>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "작성 중..." : "댓글 작성"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {comment.nickname}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(comment.created_at).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full mt-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? "로딩 중..." : "더보기"}
        </button>
      )}

      {comments.length === 0 && !loading && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
          아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
        </p>
      )}
    </div>
  );
}
