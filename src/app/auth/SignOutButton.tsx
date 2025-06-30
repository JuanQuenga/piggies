"use client";
import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { Button } from "../../components/ui/button";

export const SignOutButton = () => {
  return (
    <ClerkSignOutButton>
      <Button>Sign Out</Button>
    </ClerkSignOutButton>
  );
};
