import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLE } from "./constants/constants";

const publicRoutes = ["/", "/forgot-password"];
const authRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/verify",
  "/auth/forgot",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get("user");

  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isExplicitlyRestricted = pathname.startsWith("/orders");

  const isDynamicPublicRoute =
    /^\/[^\/]+(\/[^\/]+)?$/.test(pathname) &&
    !pathname.startsWith("/auth") &&
    !isExplicitlyRestricted;

  // 🔒 Not logged in
  if (!userCookie) {
    if (!isAuthRoute && !isPublicRoute && !isDynamicPublicRoute) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Unauthenticated users accessing root should go to dashboard
    // if (pathname === "/") {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    // Unauthenticated users accessing dashboard should go to menu
    if (pathname.includes("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const user = JSON.parse(userCookie.value || "{}");

  // 🚫 Redirect logged-in users away from auth pages
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // // 🧭 Handle root path "/"
  // if (pathname === "/") {
  //   if (user?.roleId !== USER_ROLE.USER) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  // 🚫 Public users can't access /dashboard
  if (pathname.includes("/dashboard") && user?.roleId === USER_ROLE.USER) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
