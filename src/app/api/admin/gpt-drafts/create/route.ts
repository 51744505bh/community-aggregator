import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_ARTICLE_TYPES: Record<string, string> = {
  guide: "GUIDE",
  comparison: "COMPARISON",
  trend_roundup: "TREND_ROUNDUP",
  issue_bridge: "ISSUE_BRIDGE",
  topic_hub: "TOPIC_HUB",
};

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 2;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix++;
  }
  return slug;
}

export async function POST(request: NextRequest) {
  // --- Bearer 인증 ---
  const authHeader = request.headers.get("authorization");
  const secret = process.env.GPT_ACTION_SECRET;
  if (!secret) {
    return NextResponse.json({ success: false, error: "Server misconfigured" }, { status: 500 });
  }
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // --- Request body 파싱 ---
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // --- 필수 필드 검증 ---
  const { sourceUrls, projectSlug, articleType, title, bodyMarkdown } = body as {
    sourceUrls?: string[];
    projectSlug?: string;
    articleType?: string;
    title?: string;
    bodyMarkdown?: string;
  };

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
  }
  if (!bodyMarkdown || typeof bodyMarkdown !== "string" || !bodyMarkdown.trim()) {
    return NextResponse.json({ success: false, error: "bodyMarkdown is required" }, { status: 400 });
  }
  if (!sourceUrls || !Array.isArray(sourceUrls) || sourceUrls.length === 0) {
    return NextResponse.json({ success: false, error: "sourceUrls is required (array)" }, { status: 400 });
  }
  if (!articleType || !VALID_ARTICLE_TYPES[articleType]) {
    return NextResponse.json({
      success: false,
      error: `articleType must be one of: ${Object.keys(VALID_ARTICLE_TYPES).join(", ")}`,
    }, { status: 400 });
  }

  // --- 프로젝트 매핑 ---
  const resolvedProjectSlug = (typeof projectSlug === "string" && projectSlug.trim())
    ? projectSlug.trim()
    : "default-editorial";

  const project = await prisma.project.findUnique({ where: { slug: resolvedProjectSlug } });
  // projectSlug 없으면 fallback (거절하지 않음)
  const projectId = project?.id ?? null;

  // --- Slug 처리 ---
  const rawSlug = typeof body.slug === "string" && body.slug.trim()
    ? body.slug.trim()
    : title.trim();
  const baseSlug = sanitizeSlug(rawSlug);
  const slug = await resolveUniqueSlug(baseSlug || "draft");

  // --- 옵셔널 필드 추출 ---
  const tenSecondSummary = typeof body.tenSecondSummary === "string" ? body.tenSecondSummary.trim() : null;
  const intro = typeof body.intro === "string" ? body.intro.trim() : null;
  const sourceNotes = typeof body.sourceNotes === "string" ? body.sourceNotes.trim() : null;
  const language = typeof body.language === "string" ? body.language.trim() : "ko";

  // FAQ 변환: [{q, a}] → markdown
  let faqMd: string | null = null;
  if (Array.isArray(body.faq)) {
    const faqItems = (body.faq as { q?: string; a?: string }[])
      .filter((f) => f.q && f.a)
      .map((f) => `## Q. ${f.q}\n${f.a}`)
      .join("\n\n");
    if (faqItems) faqMd = faqItems;
  }

  // SEO
  const seo = body.seo as { metaTitle?: string; metaDescription?: string } | undefined;
  const seoTitle = seo?.metaTitle?.trim() || null;
  const metaDescription = seo?.metaDescription?.trim() || null;

  // Monetization
  const monetization = body.monetization as {
    disclosureEnabled?: boolean;
    ctaTemplate?: string;
    adsEnabled?: boolean;
    affiliateBlockKey?: string;
  } | undefined;

  const affiliateDisclosureEnabled = monetization?.disclosureEnabled ?? false;
  const ctaTemplate = monetization?.ctaTemplate?.trim() || null;
  const adsEnabled = monetization?.adsEnabled ?? true;
  const affiliateBlockKey = monetization?.affiliateBlockKey?.trim() || null;

  // --- DB 저장 ---
  try {
    // 본문: intro가 있으면 본문 앞에 붙이기
    const fullBody = intro ? `${intro}\n\n${bodyMarkdown}` : bodyMarkdown;

    const article = await prisma.article.create({
      data: {
        projectId,
        articleType: VALID_ARTICLE_TYPES[articleType] as "GUIDE" | "COMPARISON" | "TREND_ROUNDUP" | "ISSUE_BRIDGE" | "TOPIC_HUB",
        title: title.trim(),
        slug,
        status: "DRAFT",
        summary: tenSecondSummary,
        intro: intro,
        bodyMd: fullBody,
        faqMd,
        seoTitle,
        metaDescription,
        affiliateDisclosureEnabled,
        ctaTemplate,
        adsEnabled,
        affiliateBlockKey,
        origin: "gpt_action",
        language,
        sourceNotes,
      },
    });

    // ArticleSource 저장
    if (sourceUrls.length > 0) {
      await prisma.articleSource.createMany({
        data: sourceUrls
          .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
          .map((url) => ({
            articleId: article.id,
            sourceUrl: url.trim(),
            sourceType: "url",
            note: sourceNotes,
          })),
      });
    }

    // GptImportLog 저장
    await prisma.gptImportLog.create({
      data: {
        articleId: article.id,
        projectSlug: resolvedProjectSlug,
        articleType,
        sourceUrlsJson: sourceUrls,
        payloadJson: JSON.parse(JSON.stringify(body)),
        createdBy: "gpt_action",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dripszone.com";

    return NextResponse.json({
      success: true,
      draftId: article.id,
      editUrl: `${baseUrl}/admin/drafts/${article.id}`,
      previewPath: `/guide/${slug}`,
      status: "draft",
    });
  } catch (err) {
    console.error("GPT draft creation failed:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
