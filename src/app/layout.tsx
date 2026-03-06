import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import VisitorTracker from "@/components/VisitorTracker";
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
  title: "Dripszone - 커뮤니티 화제를 빠르게 정리하는 유머/정보 미디어",
  description:
    "커뮤니티에서 뜨는 화제를 빠르게 정리하고, 웃을 거리와 유용한 정보를 함께 제공합니다. 오늘의 정리, 이슈 해설, 유머, 정보/꿀팁, 가성비 추천 가이드.",
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
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-6">{children}</main>
        <footer className="max-w-4xl mx-auto px-4 py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <a href="/about" className="hover:text-gray-700 dark:hover:text-gray-200">About</a>
            <a href="/editorial-policy" className="hover:text-gray-700 dark:hover:text-gray-200">편집 정책</a>
            <a href="/advertise" className="hover:text-gray-700 dark:hover:text-gray-200">광고/제휴</a>
            <a href="/copyright" className="hover:text-gray-700 dark:hover:text-gray-200">저작권</a>
            <a href="/contact" className="hover:text-gray-700 dark:hover:text-gray-200">Contact</a>
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-200">개인정보처리방침</a>
            <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-200">이용약관</a>
          </div>
          <div className="flex justify-center">
            <VisitorTracker />
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            &copy; 2026 Dripszone. 수집된 게시물의 저작권은 원저작자에게 있습니다.
          </p>
        </footer>
      </body>
    </html>
  );
}
