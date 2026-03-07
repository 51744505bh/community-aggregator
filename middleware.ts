import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 middleware: /admin 라우트 보호
// Auth.js의 JWT 토큰 존재 여부로 1차 차단 (세부 권한은 서버에서 DB 재검사)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login, /admin/denied, API auth 라우트는 공개 허용
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/denied" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // /admin/* 경로: 세션 토큰 확인
  if (pathname.startsWith("/admin")) {
    // Auth.js v5 JWT 토큰 이름: authjs.session-token (또는 __Secure- prefix)
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 토큰이 있어도 세부 권한은 각 페이지에서 requireAdmin/requireRole로 DB 검증
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
