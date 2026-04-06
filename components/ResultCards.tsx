"use client";

import { useState } from "react";
import { AnalysisResult, SECTIONS, SectionData, SectionMeta } from "@/lib/types";

interface ResultCardsProps {
  result: AnalysisResult;
  isStreaming: boolean;
}

export default function ResultCards({ result, isStreaming }: ResultCardsProps) {
  const completedCount = SECTIONS.filter((s) => !!result[s.key]).length;

  return (
    <div className="w-full space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          분석 결과
        </h2>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {completedCount}/5 섹션 완료
          </span>
        )}
      </div>

      {/* Section cards */}
      {SECTIONS.map((section) => {
        const data = result[section.key];
        if (!data && !isStreaming) return null;
        return (
          <SectionCard
            key={section.key}
            meta={section}
            data={data}
            isStreaming={isStreaming && !data}
          />
        );
      })}
    </div>
  );
}

function SectionCard({
  meta,
  data,
  isStreaming,
}: {
  meta: SectionMeta;
  data: SectionData | undefined;
  isStreaming: boolean;
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  if (isStreaming) {
    // Skeleton while waiting for this section
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse`}>
        <div className={`h-1 w-full`} style={{ backgroundColor: meta.color + "40" }} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-lg`} style={{ backgroundColor: meta.color + "20" }} />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-slide-up">
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: meta.color }} />

      <div className="p-5">
        {/* Section header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">
              {meta.label}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>

        {/* Evidence accordion */}
        {data.evidence && data.evidence.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setEvidenceOpen((o) => !o)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${meta.textColor} hover:opacity-70`}
            >
              <QuoteIcon className="w-3.5 h-3.5" />
              원문 근거 보기 ({data.evidence.length}개)
              <ChevronIcon
                className={`w-3.5 h-3.5 transition-transform ${evidenceOpen ? "rotate-180" : ""}`}
              />
            </button>

            {evidenceOpen && (
              <div className={`mt-3 rounded-xl p-4 space-y-3 ${meta.bgColor}`}>
                {data.evidence.map((quote, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div
                      className="flex-shrink-0 w-0.5 rounded-full mt-1"
                      style={{ backgroundColor: meta.color, minHeight: "1rem" }}
                    />
                    <blockquote className="text-xs text-gray-600 leading-relaxed italic">
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
