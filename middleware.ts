import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. 환경 변수가 없으면 곧바로 기본 응답 반환
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  // 2. 보호된 경로 이외의 정적 파일이나 불필요한 호출은 즉시 통과
  // (이 로직은 아래 config.matcher로도 일부 제어됨)

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // 3. getUser() 호출 중 네트워크 에러나 Auth 에러가 나도 throw 하지 않도록 처리
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 4. /library 경로는 로그인 필수이므로 처리
    if (!user && request.nextUrl.pathname.startsWith("/library")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

  } catch (error) {
    // supabase 관련 에러 발생 시 앱이 크래시(500) 나지 않고 그대로 넘어가도록 처리
    console.error("Middleware Supabase Error:", error);
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
