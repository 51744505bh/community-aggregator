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

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: getReferer(url),
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "fetch failed" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "proxy error" }, { status: 500 });
  }
}
