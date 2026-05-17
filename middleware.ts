import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getDashboardPathForRole, getUserRole } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import type { UserRole } from "@/lib/types";

const ROLE_ROUTES: Record<string, UserRole> = {
  "/dashboard/admin": "super_admin",
  "/dashboard/creator": "election_creator",
  "/dashboard/voter": "voter",
};

const AUTH_REDIRECT_IF_LOGGED_IN = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/verify",
];

const VOTING_API_PATTERN =
  /^\/api\/elections\/[^/]+\/(vote|verify-secret-id)\/?$/;

function getRequiredRole(pathname: string): UserRole | null {
  for (const [route, role] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return role;
    }
  }
  return null;
}

function shouldRedirectAuthenticatedAuthUser(pathname: string): boolean {
  return AUTH_REDIRECT_IF_LOGGED_IN.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = getClientIp(request);

  if (
    method === "POST" &&
    (pathname === "/api/auth/login" ||
      pathname === "/api/auth/signup" ||
      pathname === "/api/auth/verify-captcha")
  ) {
    const result = checkRateLimit(
      `login:${ip}`,
      RATE_LIMITS.login.limit,
      RATE_LIMITS.login.windowMs
    );
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
  }

  if (method === "POST" && VOTING_API_PATTERN.test(pathname)) {
    const result = checkRateLimit(
      `voting:${ip}`,
      RATE_LIMITS.votingApi.limit,
      RATE_LIMITS.votingApi.windowMs
    );
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rateLimited = applyRateLimit(request);
  if (rateLimited) {
    return rateLimited;
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/auth");

  if (!isDashboard && !isAuth) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAuth && shouldRedirectAuthenticatedAuthUser(pathname) && user) {
    const role = await getUserRole(supabase, user);
    if (role) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = getDashboardPathForRole(role);
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (!isDashboard) {
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = await getUserRole(supabase, user);

  if (!role) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("error", "missing_role");
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = getRequiredRole(pathname);

  if (requiredRole && role !== requiredRole) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = getDashboardPathForRole(role);
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/verify-captcha",
    "/api/elections/:path*/vote",
    "/api/elections/:path*/verify-secret-id",
  ],
};
