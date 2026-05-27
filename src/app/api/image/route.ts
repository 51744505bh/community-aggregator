import { NextRequest, NextResponse } from "next/server";

const REFERER_MAP: Record<string, string> = {
  "dcinside.co.kr": "https://gall.dcinside.com/",
  "dcinside.com": "https://gall.dcinside.com/",
  "ruliweb.com": "https://bbs.ruliweb.com/",
  "fmkorea.com": "https://www.fmkorea.com/",
  "bobaedream.co.kr": "https://www.bobaedream.co.kr/",
  "dogdrip.net": "https://www.dogdrip.net/",
  "clien.net": "https://www.clien.net/",
  "ppomppu.co.kr": "https://www.ppomppu.co.kr/",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;
const BROWSER_CACHE_SECONDS = 60 * 60 * 24;
const CDN_CACHE_SECONDS = 60 * 60 * 24 * 7;

function getReferer(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    for (const [domain, referer] of Object.entries(REFERER_MAP)) {
      if (hostname.includes(domain)) {
        return referer;
      }
    }
    return new URL(url).origin + "/";
  } catch {
    return "";
  }
}

const ALLOWED_DOMAINS = [
  "dcinside.co.kr",
  "dcinside.com",
  "ruliweb.com",
  "fmkorea.com",
  "bobaedream.co.kr",
  "dogdrip.net",
  "clien.net",
  "ppomppu.co.kr",
  "imgur.com",
  "i.imgur.com",
  "pstatic.net",
  "naver.net",
  "postfiles.pstatic.net",
];

function parseAllowedImageUrl(url: string): URL | null {
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    const hostname = parsedUrl.hostname;
    const isAllowed = ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain));
    return isAllowed ? parsedUrl : null;
  } catch {
    return null;
  }
}

function limitImageStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  let bytes = 0;

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;

        if (bytes > MAX_IMAGE_BYTES) {
          controller.error(new Error("image too large"));
          return;
        }

        controller.enqueue(chunk);
      },
    }),
  );
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  const imageUrl = parseAllowedImageUrl(url);

  if (!imageUrl) {
    return NextResponse.json({ error: "domain not allowed" }, { status: 403 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: getReferer(imageUrl.toString()),
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "fetch failed", status: res.status, statusText: res.statusText }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/") && contentType !== "application/octet-stream") {
      return NextResponse.json({ error: "invalid content type" }, { status: 415 });
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "image too large" }, { status: 413 });
    }

    if (!res.body) {
      return NextResponse.json({ error: "empty image response" }, { status: 502 });
    }

    return new NextResponse(limitImageStream(res.body), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=${CDN_CACHE_SECONDS}, stale-while-revalidate=${BROWSER_CACHE_SECONDS}`,
        "CDN-Cache-Control": `public, max-age=${CDN_CACHE_SECONDS}, stale-while-revalidate=${BROWSER_CACHE_SECONDS}`,
        "Vercel-CDN-Cache-Control": `public, max-age=${CDN_CACHE_SECONDS}, stale-while-revalidate=${BROWSER_CACHE_SECONDS}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    clearTimeout(timeout);
    return NextResponse.json({ error: "proxy error", detail: String(e) }, { status: 500 });
  }
}
