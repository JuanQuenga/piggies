import { signOut } from "@workos-inc/authkit-nextjs";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await signOut();
  return Response.redirect(new URL("/", request.url));
}
