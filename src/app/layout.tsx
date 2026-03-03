import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import VisitorTracker from "@/components/VisitorTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "커뮤니티 인기글 - 실시간 베스트 모아보기",
  description:
    "에펨코리아, 디시인사이드, 루리웹, 보배드림, 도그드립 인기글을 한 곳에서 모아보세요.",
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
        <NavBar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-6">{children}</main>
        <footer className="max-w-4xl mx-auto px-4 py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <a href="/about" className="hover:text-gray-700 dark:hover:text-gray-200">About</a>
            <a href="/contact" className="hover:text-gray-700 dark:hover:text-gray-200">Contact</a>
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-200">개인정보처리방침</a>
          </div>
          <div className="flex justify-center">
            <VisitorTracker />
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            &copy; 2026 커뮤니티 인기글. 모든 게시물의 저작권은 원저작자에게 있습니다.
          </p>
        </footer>
      </body>
    </html>
  );
}
