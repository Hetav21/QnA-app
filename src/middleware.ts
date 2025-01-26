import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { response } from "./lib/response";
export { default } from "next-auth/middleware";

async function blockCors(req: NextRequest) {
  const origin = req.headers.get("origin");

  // If there is an origin, block the request
  if (origin) {
    return new NextResponse(null, {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

export async function middleware(request: NextRequest) {
  await blockCors(request);

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
  matcher: "/:path*",
};
