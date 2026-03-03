"use client";

import { useEffect, useState } from "react";

export default function VisitorTracker() {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);

  useEffect(() => {
    const key = "visited_today";
    const today = new Date().toISOString().slice(0, 10);
    const visited = localStorage.getItem(key);

    if (visited === today) {
      fetch("/api/visitors")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    } else {
      fetch("/api/visitors", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          localStorage.setItem(key, today);
          return fetch("/api/visitors");
        })
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
      <span>오늘 방문 {stats.today.toLocaleString()}</span>
      <span>전체 방문 {stats.total.toLocaleString()}</span>
    </div>
  );
}
