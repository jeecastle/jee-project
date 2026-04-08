import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grounded — 문헌 구조 분석기",
  description:
    "PDF나 텍스트를 업로드하면 주제·방법론·결론·시사점·반론을 구조적으로 추출하고, 각 항목의 원문 근거를 추적합니다.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HDESS5ZFQE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HDESS5ZFQE');
          `}
        </Script>

        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <GroundedLogo />
              <div>
                <span className="text-sm font-bold text-gray-900 leading-tight block">
                  Grounded
                </span>
                <span className="text-xs text-gray-400 leading-tight hidden sm:block">
                  모든 이야기에는 근거가 필요합니다.
                </span>
              </div>
            </Link>
            <AuthButton initialUserEmail={user?.email} />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

function GroundedLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="5" r="2" stroke="white" strokeWidth="1.5" />
        <line x1="9" y1="7" x2="9" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 10.5 Q9 13.5 13 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <line x1="5" y1="15" x2="13" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
