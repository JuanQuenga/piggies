import { Map, User, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";

interface BottomNavProps {
  activeTab: "map" | "profile" | "chat";
  setActiveTab: (tab: "map" | "profile" | "chat") => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 border-t border-border flex justify-around items-center h-16 md:hidden shadow-2xl">
      <Button
        variant={activeTab === "map" ? "default" : "ghost"}
        size="icon"
        onClick={() => setActiveTab("map")}
        className="flex flex-col items-center gap-0"
      >
        <Map className="w-6 h-6" />
        <span className="text-xs">Map</span>
      </Button>
      <Button
        variant={activeTab === "profile" ? "default" : "ghost"}
        size="icon"
        onClick={() => setActiveTab("profile")}
        className="flex flex-col items-center gap-0"
      >
        <User className="w-6 h-6" />
        <span className="text-xs">Profile</span>
      </Button>
      <Button
        variant={activeTab === "chat" ? "default" : "ghost"}
        size="icon"
        onClick={() => setActiveTab("chat")}
        className="flex flex-col items-center gap-0"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-xs">Chat</span>
      </Button>
    </nav>
  );
}
