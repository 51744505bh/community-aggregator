"use client";

import { useEffect, useState } from "react";

export default function ViewCounter({ postId }: { postId: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const key = `viewed_${postId}`;
    const already = sessionStorage.getItem(key);

    if (already) {
      fetch(`/api/views/${postId}`)
        .then((r) => r.json())
        .then((d) => setViews(d.views))
        .catch(() => {});
    } else {
      fetch(`/api/views/${postId}`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          setViews(d.views);
          sessionStorage.setItem(key, "1");
        })
        .catch(() => {});
    }
  }, [postId]);

  if (views === null) return null;

  return <span>사이트 조회 {views.toLocaleString()}</span>;
}
