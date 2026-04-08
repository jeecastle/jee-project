"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface AuthButtonProps {
  initialUserEmail?: string | null;
}

export default function AuthButton({ initialUserEmail }: AuthButtonProps) {
  const [userEmail, setUserEmail] = useState<string | null>(
    initialUserEmail ?? null
  );
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
      router.refresh(); // 서버 컴포넌트(레이아웃 등) 재렌더
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
