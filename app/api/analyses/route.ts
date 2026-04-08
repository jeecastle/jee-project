import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const MAX_SAVES = 10;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 저장 개수 확인
  const { count } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count !== null && count >= MAX_SAVES) {
    return NextResponse.json(
      {
        error: `최대 ${MAX_SAVES}개까지 저장 가능합니다. 기존 항목을 삭제 후 다시 시도해주세요.`,
      },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { title, result } = body;

  if (!title || !result) {
    return NextResponse.json(
      { error: "제목과 분석 결과가 필요합니다." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({ user_id: user.id, title: title.slice(0, 100), result })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
