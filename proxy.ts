import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-session";

export const config = {
  matcher: ["/", "/admin/:path*"],
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { env } = await getCloudflareContext({ async: true });
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

  if (pathname === "/") {
    const { success } = await env.HOMEPAGE_LIMITER.limit({ key: ip });
    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token, env.ADMIN_PASSWORD);
  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
