"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const router = useRouter();

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <Button onClick={handleSignIn} className="w-full">
      Sign In
    </Button>
  );
}
