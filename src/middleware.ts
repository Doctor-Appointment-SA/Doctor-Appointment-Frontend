import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Apply middleware only to protected routes
export const config = {
  matcher: ["/payment/:path*"],
};

export async function middleware(req: NextRequest) {
  // ============================== to make Middleware dont work for every request (exclude Nextjs internal request) ==============================
  // only Allow req that enter the page to pass this guard
  let ok;
  ok = await PreventUnnesessaryReq(req);
  if (ok) return NextResponse.next();

  // =========================== auth logic ==============================
  ok = await AuthenticationLogic(req)
  if (!ok) return NextResponse.redirect(new URL("/authen", req.url));


  // Allow access if verified
  console.log("middleware allow req");
  return NextResponse.next();
}

async function PreventUnnesessaryReq(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // 1) Skip obvious internal/static stuff
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") // if you serve from /public/images
  ) {
    return true;
  }

  // 2) Skip Next.js prefetch requests (hover prefetch etc.)
  // Next sets this header for prefetches
  if (req.headers.get("x-middleware-prefetch") === "1") {
    return true;
  }

  // 3) Only run on real page navigations (HTML), not JSON/data fetches
  const accept = req.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    return true;
  }

  // 4) (Optional) Only for normal GET navigations
  if (req.method !== "GET") {
    return true;
  }

  return false;
}

async function AuthenticationLogic(req: NextRequest) {
  const raw = req.cookies.get("auth")?.value || "";

  let access_token = "";
  // console.log("raw", raw);

  if (raw) {
    try {
      access_token = JSON.parse(decodeURIComponent(raw)).access_token ?? "";
    } catch {}
  }

  // If token is missing → redirect to login
  if (!access_token) {
    console.log("access_token is missing");
    return false;
  }

  // Check if token is correct
  const res = await fetch("http://localhost:4001/api/auth/whoami", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  console.log("res", res);
  if (!res.ok) {
    console.log("access_token is not correct (after authentication)");

    // refresh the token
    return false;
  }

  return true;
}