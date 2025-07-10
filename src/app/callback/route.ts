import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
  onSuccess: (user) => {
    console.log("WorkOS user:", user);
    // Let WorkOS AuthKit handle the redirect automatically
    // The session cookie will be set and the user will be redirected to the default success URL
  },
  onError: ({ error, request }) => {
    console.log("WorkOS error:", error);
    // Return a redirect response for errors
    return Response.redirect(new URL("/", request.url));
  },
});
