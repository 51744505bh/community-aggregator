"use client";

import { useEffect, useRef } from "react";

export default function AdBanner({ type = "adsense" }: { type?: "adsense" | "coupang" }) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (type !== "adsense") return;
    if (pushed.current) return;
    try {
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, [type]);

  if (type === "coupang") {
    return (
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-700 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg py-6 my-4">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          쿠팡파트너스 광고 영역
        </span>
      </div>
    );
  }

  return (
    <div className="my-4" ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4523418158311949"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
