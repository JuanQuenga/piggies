import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/"],
  },
  redirectUri:
    process.env.WORKOS_REDIRECT_URI || "http://localhost:3000/callback",
});

// Match all app routes except static assets and API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api|.*\\..*).*)"],
};
