"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function AuthPage() {
  const [tab, setTab] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${tab === "sign-in" ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setTab("sign-in")}
        >
          Sign In
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === "sign-up" ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setTab("sign-up")}
        >
          Sign Up
        </button>
      </div>
      <div className="w-full max-w-md">
        {tab === "sign-in" ? (
          <SignIn routing="hash" />
        ) : (
          <SignUp routing="hash" />
        )}
      </div>
    </div>
  );
}
