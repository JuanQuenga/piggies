"use client";
import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { Button } from "../../components/ui/button";

export const SignOutButton = () => {
  return (
    <ClerkSignOutButton>
      <Button className="bg-[#FF1493] hover:bg-[#FF69B4] text-white font-semibold">
        Sign Out
      </Button>
    </ClerkSignOutButton>
  );
};
