export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ResultCards from "@/components/ResultCards";
import Link from "next/link";
import type { SavedAnalysis } from "@/lib/types";

export default async function LibraryItemPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  const analysis = data as SavedAnalysis;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/library"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← 라이브러리로 돌아가기
        </Link>
        <h1 className="text-lg font-bold text-gray-900 mt-3 leading-snug">
          {analysis.title}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(analysis.created_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* 분석 결과 카드 */}
      <ResultCards result={analysis.result} isStreaming={false} />
    </div>
  );
}
