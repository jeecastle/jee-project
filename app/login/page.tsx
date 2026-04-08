"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const searchParams = useSearchParams();
  const hasAuthError = searchParams.get("error") === "auth_failed";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <MailIcon className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">이메일을 확인하세요</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-700">{email}</span>으로<br />
          로그인 링크를 발송했습니다.
        </p>
        <p className="text-xs text-gray-400">
          링크는 1시간 동안 유효합니다. 스팸함도 확인해보세요.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-blue-500 hover:underline"
        >
          다른 이메일로 재시도
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">로그인</h2>
        <p className="text-sm text-gray-500">
          이메일을 입력하면 로그인 링크를 보내드립니다.
        </p>
      </div>

      {hasAuthError && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          인증에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !email.trim()}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
          status === "sending" || !email.trim()
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-700"
        }`}
      >
        {status === "sending" ? "발송 중..." : "로그인 링크 받기"}
      </button>

      <p className="text-center text-xs text-gray-400">
        계정이 없어도 이메일만 입력하면 자동으로 가입됩니다.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-900 font-bold text-lg">
            <GroundedMark />
            Grounded
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function GroundedMark() {
  return (
    <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="5" r="2" stroke="white" strokeWidth="1.5" />
        <line x1="9" y1="7" x2="9" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 10.5 Q9 13.5 13 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <line x1="5" y1="15" x2="13" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
