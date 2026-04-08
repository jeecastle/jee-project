"use client";

import { useState, useEffect } from "react";
import InputSection from "@/components/InputSection";
import ResultCards from "@/components/ResultCards";
import SaveButton from "@/components/SaveButton";
import { createClient } from "@/lib/supabase/client";
import { AnalysisResult } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult>({});
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 로그인 상태 구독
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setAppState("loading");
    setResult({});
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "서버 오류가 발생했습니다." }));
        throw new Error(err.error ?? "서버 오류가 발생했습니다.");
      }

      if (!res.body) throw new Error("스트림을 받을 수 없습니다.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        if (chunk.includes("__ERROR__:")) {
          const msg = chunk.split("__ERROR__:")[1]?.trim();
          throw new Error(msg ?? "분석 중 오류가 발생했습니다.");
        }

        buffer += chunk;

        const sectionRegex =
          /<section name="(\w+)">\s*([\s\S]*?)\s*<\/section>/g;
        let match: RegExpExecArray | null;

        while ((match = sectionRegex.exec(buffer)) !== null) {
          const [, sectionName, jsonStr] = match;
          try {
            const data = JSON.parse(jsonStr.trim());
            setResult((prev) => ({ ...prev, [sectionName]: data }));
          } catch {
            // 섹션 JSON이 아직 완전히 수신되지 않음, 계속 버퍼링
          }
        }
      }

      setAppState("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(message);
      setAppState("error");
    }
  };

  const isStreaming = appState === "loading";
  const hasResults = Object.keys(result).length > 0;

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div
          className={`grid gap-8 transition-all ${
            hasResults || isStreaming
              ? "grid-cols-1 lg:grid-cols-[420px_1fr]"
              : "grid-cols-1 max-w-xl mx-auto"
          }`}
        >
          {/* 왼쪽: 입력 */}
          <div>
            {appState === "idle" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                  문헌을 넣고, 구조를 확인해 보세요.
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-snug">
                  <span className="block">PDF나 텍스트를 업로드해 보세요.</span>
                  <span className="block mt-1">문헌의 핵심 구조를 추출하고, 각 항목의 근거를 원문과 함께 제공합니다.</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    "주제",
                    "방법론",
                    "결론",
                    "시사점",
                    "반론",
                  ].map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <InputSection onSubmit={handleSubmit} isLoading={isStreaming} />
            </div>

            {appState === "error" && error && (
              <div className="mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <strong className="font-medium">오류:</strong> {error}
              </div>
            )}

            {/* 저장 버튼 (분석 완료 시) */}
            {appState === "done" && (
              <div className="mt-4 px-1">
                <SaveButton
                  result={result as AnalysisResult}
                  isLoggedIn={!!user}
                />
              </div>
            )}
          </div>

          {/* 오른쪽: 결과 */}
          {(hasResults || isStreaming) && (
            <div className="animate-fade-in">
              <ResultCards result={result} isStreaming={isStreaming} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
