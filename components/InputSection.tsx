"use client";

import { useRef, useState } from "react";

type InputMode = "pdf" | "text";

interface InputSectionProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export default function InputSection({ onSubmit, isLoading }: InputSectionProps) {
  const [mode, setMode] = useState<InputMode>("pdf");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "analyze_document");
    }

    const fd = new FormData();
    if (mode === "pdf" && file) {
      fd.append("file", file);
    } else if (mode === "text" && text.trim()) {
      fd.append("text", text.trim());
    }
    onSubmit(fd);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "upload_pdf");
      }
    }
  };

  const canSubmit =
    !isLoading &&
    ((mode === "pdf" && !!file) || (mode === "text" && text.trim().length > 50));

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
        {(["pdf", "text"] as InputMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === m
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "pdf" ? "PDF 업로드" : "텍스트 붙여넣기"}
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === "pdf" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : file
              ? "border-emerald-400 bg-emerald-50"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] ?? null;
              setFile(selectedFile);
              if (selectedFile && typeof window !== "undefined" && (window as any).gtag) {
                (window as any).gtag("event", "upload_pdf");
              }
            }}
          />
          {file ? (
            <>
              <PdfIcon className="w-10 h-10 text-emerald-500" />
              <div className="text-center">
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
              >
                제거
              </button>
            </>
          ) : (
            <>
              <UploadIcon className="w-10 h-10 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  PDF 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-gray-400 mt-1">최대 10MB</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="분석할 문헌의 텍스트를 붙여넣으세요&#10;&#10;논문, 뉴스 기사, 보고서 등 어떤 형태의 텍스트도 분석 가능합니다."
          className="w-full h-56 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all scrollbar-thin"
        />
      )}

      {/* Character count for text mode */}
      {mode === "text" && text.length > 0 && (
        <p className="text-xs text-gray-400 mt-1.5 text-right">
          {text.length.toLocaleString()}자
          {text.length < 50 && (
            <span className="text-amber-500 ml-1">(최소 50자 이상)</span>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          canSubmit
            ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.99]"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="w-4 h-4 animate-spin" />
            분석 중...
          </span>
        ) : (
          "문헌 분석하기"
        )}
      </button>
    </form>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
