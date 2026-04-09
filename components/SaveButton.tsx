"use client";

import { useState } from "react";
import Link from "next/link";
import { AnalysisResult } from "@/lib/types";

interface SaveButtonProps {
  result: AnalysisResult;
  isLoggedIn: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function SaveButton({ result, isLoggedIn }: SaveButtonProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "save_analysis");
    }

    setStatus("saving");
    setErrorMsg("");

    // 주제 요약에서 자동으로 제목 생성
    const title =
      result.topic?.summary?.slice(0, 80) ??
      `분석 결과 — ${new Date().toLocaleDateString("ko-KR")}`;

    const res = await fetch("/api/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, result }),
    });

    if (res.ok) {
      setStatus("saved");
    } else {
      const err = await res.json().catch(() => ({ error: "저장에 실패했습니다." }));
      setErrorMsg(err.error ?? "저장에 실패했습니다.");
      setStatus("error");
    }
  };

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-gray-400">
        <Link href="/login" className="text-blue-500 hover:underline font-medium">
          로그인
        </Link>
        하면 분석 결과를 저장할 수 있습니다.
      </p>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
        <CheckIcon className="w-4 h-4" />
        저장되었습니다.{" "}
        <Link href="/library" className="underline hover:opacity-70">
          라이브러리 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleSave}
        disabled={status === "saving"}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
          status === "saving"
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99]"
        }`}
      >
        <BookmarkIcon className="w-4 h-4" />
        {status === "saving" ? "저장 중..." : "결과 저장하기"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}
