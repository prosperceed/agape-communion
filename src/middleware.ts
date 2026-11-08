import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SUPER_ADMIN_ONLY_PATHS = [
  "/admin/users",
  "/admin/settings",
  "/admin/activity-logs",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/accept-invite")
  ) {
    return NextResponse.next();
  }

  const secret =
    process.env.AUTH_SECRET ||
    "agape-communion-church-super-secret-key-change-in-production-32chars";

  const token = await getToken({ req: request, secret });

  if (!token || token.status !== "ACTIVE") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isSuperAdminRoute = SUPER_ADMIN_ONLY_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isSuperAdminRoute && token.role !== "SUPER_ADMIN") {
    const dashboardUrl = new URL("/admin", request.url);
    dashboardUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
