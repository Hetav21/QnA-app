import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If user is logged in and trying to access [sign-in, sign-up, verify], redirect to dashboard
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (!token && url.pathname.startsWith("/dashboard")) {
    // If user is not logged in and trying to access the site, redirect to /sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
};
