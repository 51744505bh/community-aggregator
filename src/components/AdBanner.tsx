export default function AdBanner({ type = "adsense" }: { type?: "adsense" | "coupang" }) {
  return (
    <div className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg py-6 my-4">
      <span className="text-sm text-gray-400">
        {type === "adsense" ? "Google AdSense 광고 영역" : "쿠팡파트너스 광고 영역"}
      </span>
    </div>
  );
}
