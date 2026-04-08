"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. 초기 사용자 상태 가져오기
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });

    // 2. 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!userEmail) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/library"
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
      >
        내 라이브러리
      </Link>
      <span className="text-xs text-gray-400 max-w-[120px] truncate hidden sm:block">
        {userEmail}
      </span>
      <button
        onClick={handleSignOut}
        className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
