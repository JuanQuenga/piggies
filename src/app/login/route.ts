import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export const GET = async () => {
  // Debug: Log the environment variable
  console.log(
    "NEXT_PUBLIC_WORKOS_REDIRECT_URI:",
    process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI
  );

  const signInUrl = await getSignInUrl();
  console.log("SignIn URL:", signInUrl);

  // Log the full URL to see what's being sent to WorkOS
  const url = new URL(signInUrl);
  console.log(
    "WorkOS redirect_uri parameter:",
    url.searchParams.get("redirect_uri")
  );

  return redirect(signInUrl);
};
