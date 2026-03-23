import Link from "next/link";

type GuideLink = {
  slug: string;
  title: string;
};

const TEMPLATE_MATCHERS: Record<
  string,
  {
    title: string;
    bullets: string[];
    primaryLabel: string;
    secondaryLabel: string;
  }
> = {
  default: {
    title: "이런 분께 잘 맞습니다",
    bullets: [
      "가성비를 가장 중요하게 보는 분",
      "후기 많은 검증된 선택지를 먼저 보고 싶은 분",
      "비교 시간을 줄이고 빠르게 판단하고 싶은 분",
      "실사용 관점의 추천 포인트만 확인하고 싶은 분",
    ],
    primaryLabel: "추천 제품 한 번에 보기",
    secondaryLabel: "가격 비교하러 가기",
  },
  budget: {
    title: "이런 분께 잘 맞습니다",
    bullets: [
      "너무 비싼 제품은 부담스러운 분",
      "가격 대비 만족도가 중요한 분",
      "자주 쓰는 물건부터 먼저 정리하고 싶은 분",
      "실패 확률 낮은 입문용 선택지를 찾는 분",
    ],
    primaryLabel: "가성비 추천 바로 보기",
    secondaryLabel: "현재 가격 확인하기",
  },
  desk: {
    title: "이런 분께 잘 맞습니다",
    bullets: [
      "오래 앉아 일하거나 공부하는 분",
      "책상 위 체감 좋은 물건만 추리고 싶은 분",
      "지저분한 데스크 환경을 정리하고 싶은 분",
      "실사용 후기 많은 아이템 위주로 보고 싶은 분",
    ],
    primaryLabel: "데스크템 정리 보기",
    secondaryLabel: "비교 포인트 확인하기",
  },
};

function getTemplateConfig(template?: string | null) {
  if (!template) return TEMPLATE_MATCHERS.default;
  const key = template.toLowerCase();
  return TEMPLATE_MATCHERS[key] || TEMPLATE_MATCHERS.default;
}

export default function GuideConversionBlocks({
  guideIndexPath,
  affiliateDisclosureEnabled,
  ctaTemplate,
  relatedGuides,
}: {
  guideIndexPath: string;
  affiliateDisclosureEnabled: boolean;
  ctaTemplate?: string | null;
  relatedGuides: GuideLink[];
}) {
  const template = getTemplateConfig(ctaTemplate);

  return (
    <div className="space-y-4 mb-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{template.title}</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {template.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href={guideIndexPath}
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            {template.primaryLabel}
          </Link>
          <Link
            href={guideIndexPath}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {template.secondaryLabel}
          </Link>
        </div>
      </section>

      {affiliateDisclosureEnabled && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
          <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">
            구매 전에 이것만 확인하세요
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-100">
            이 글에는 제휴 링크가 포함될 수 있습니다. 다만 비싼 제품을 우선 노출하지 않고,
            가격, 후기, 사용 장면을 함께 비교해서 실제로 도움이 되는 항목만 정리합니다.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={guideIndexPath}
              className="inline-flex items-center justify-center rounded-full bg-amber-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
            >
              실사용 후기 많은 제품 보기
            </Link>
            <Link
              href={guideIndexPath}
              className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
            >
              현재 가격 확인하기
            </Link>
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            같이 보면 판단이 쉬워집니다
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {relatedGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guide/${guide.slug}`}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
