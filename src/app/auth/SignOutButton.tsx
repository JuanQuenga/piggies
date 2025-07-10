"use client";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = () => {
    router.push("/api/logout");
  };

  return (
    <Button
      onClick={handleSignOut}
      className="bg-[#FF1493] hover:bg-[#FF69B4] text-white font-semibold"
    >
      Sign Out
    </Button>
  );
};
