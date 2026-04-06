"use client";

import { useState } from "react";
import InputSection from "@/components/InputSection";
import ResultCards from "@/components/ResultCards";
import { AnalysisResult } from "@/lib/types";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult>({});
  const [error, setError] = useState<string | null>(null);

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

        // Check for server-side error signal
        if (chunk.includes("__ERROR__:")) {
          const msg = chunk.split("__ERROR__:")[1]?.trim();
          throw new Error(msg ?? "분석 중 오류가 발생했습니다.");
        }

        buffer += chunk;

        // Parse complete sections as they appear in the stream
        const sectionRegex =
          /<section name="(\w+)">\s*([\s\S]*?)\s*<\/section>/g;
        let match: RegExpExecArray | null;

        while ((match = sectionRegex.exec(buffer)) !== null) {
          const [, sectionName, jsonStr] = match;
          try {
            const data = JSON.parse(jsonStr.trim());
            setResult((prev) => ({
              ...prev,
              [sectionName]: data,
            }));
          } catch {
            // Section JSON not yet fully received, continue buffering
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
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GroundedLogo />
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Grounded
              </h1>
              <p className="text-xs text-gray-400 leading-tight">
                모든 이야기에는 근거가 있어야 한다
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-300 font-medium hidden sm:block">
            MVP · Powered by Claude
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div
          className={`grid gap-8 transition-all ${
            hasResults || isStreaming
              ? "grid-cols-1 lg:grid-cols-[420px_1fr]"
              : "grid-cols-1 max-w-xl mx-auto"
          }`}
        >
          {/* Left: Input */}
          <div>
            {/* Hero text (only when idle) */}
            {appState === "idle" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                  문헌을 넣으면<br />
                  구조가 보입니다
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  PDF나 텍스트를 업로드하면 주제·방법론·결론·시사점·반론을
                  자동으로 추출하고, 각 항목의 원문 근거를 추적합니다.
                </p>

                {/* Target users */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {["대학원생 · 연구자", "PM · 기획자", "컨설턴트", "기자 · 크리에이터"].map(
                    (label) => (
                      <span
                        key={label}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <InputSection onSubmit={handleSubmit} isLoading={isStreaming} />
            </div>

            {/* Error message */}
            {appState === "error" && error && (
              <div className="mt-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <strong className="font-medium">오류:</strong> {error}
              </div>
            )}
          </div>

          {/* Right: Results */}
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

function GroundedLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Anchor-like icon representing "grounded" */}
        <circle cx="9" cy="5" r="2" stroke="white" strokeWidth="1.5" />
        <line x1="9" y1="7" x2="9" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M5 10.5 Q9 13.5 13 10.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <line x1="5" y1="15" x2="13" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
