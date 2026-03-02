import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-6">{children}</main>
      </body>
    </html>
  );
}
