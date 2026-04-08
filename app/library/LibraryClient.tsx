"use client";

import { useState } from "react";
import Link from "next/link";
import type { SavedAnalysis } from "@/lib/types";

type ListItem = Pick<SavedAnalysis, "id" | "title" | "created_at">;

interface LibraryClientProps {
  initialItems: ListItem[];
}

export default function LibraryClient({ initialItems }: LibraryClientProps) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("이 분석 결과를 삭제하시겠습니까?")) return;

    setDeletingId(id);
    const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });

    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
    setDeletingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">내 라이브러리</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length}/10개 저장됨
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← 새 분석
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <BookmarkIcon className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">저장된 분석 결과가 없습니다.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm text-blue-500 hover:underline"
          >
            문헌 분석 시작하기
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/library/${item.id}`}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  열람
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {deletingId === item.id ? "..." : "삭제"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}
