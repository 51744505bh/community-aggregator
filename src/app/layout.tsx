import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { OrganizationJsonLd } from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dripszone - 커뮤니티 베스트 피드 허브",
  description:
    "24시간, 주간, 월간 기준으로 커뮤니티 인기글을 빠르게 모아보는 피드 허브입니다.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4523418158311949"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OrganizationJsonLd />
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl border-t border-gray-200 px-4 py-8">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <a href="/about" className="hover:text-gray-800">About</a>
            <a href="/editorial-policy" className="hover:text-gray-800">편집 정책</a>
            <a href="/advertise" className="hover:text-gray-800">광고/제휴</a>
            <a href="/copyright" className="hover:text-gray-800">저작권</a>
            <a href="/contact" className="hover:text-gray-800">Contact</a>
            <a href="/privacy" className="hover:text-gray-800">개인정보처리방침</a>
            <a href="/terms" className="hover:text-gray-800">이용약관</a>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            &copy; 2026 Dripszone. 수집된 게시물의 저작권은 원저작자에게 있습니다.
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
