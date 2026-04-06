import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grounded — 문헌 구조 분석기",
  description:
    "PDF나 텍스트를 업로드하면 주제·방법론·결론·시사점·반론을 구조적으로 추출하고, 각 항목의 원문 근거를 추적합니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
