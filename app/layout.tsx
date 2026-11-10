import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "Markdown ブログ（静的生成）";
const siteDescription =
  "Next.js の静的サイト生成（SSG）で作った、Markdown ベースの軽量ブログです。";

export const metadata: Metadata = {
  // OpenGraph の URL などを、相対パスから絶対 URL に変換するための基準
  metadataBase: new URL("https://my-md-blog-mu.vercel.app"),
  title: siteName,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName,
    title: siteName,
    description: siteDescription,
    url: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
