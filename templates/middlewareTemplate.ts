import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);


const apiAuthPrefix = "/api/auth";
const DEFAULT_LOGIN_REDIRECT = "/";
const authRoutes = ["/auth/signin"];
const publicRoutes = ["/signin", "/signup", "/api/public"];

export default auth((req:any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  // Redirect logged-in users away from signin/signup
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // Redirect unauthenticated users away from protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/api/auth/signin", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
