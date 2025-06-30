"use client";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "../../components/ui/button";

export const SignInForm = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <SignInButton>
        <Button className="w-full">Sign In</Button>
      </SignInButton>
    </div>
  );
};
