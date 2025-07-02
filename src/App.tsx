"use client";

import React, { useState } from "react";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
  useConvexAuth,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm, SignOutButton } from "./app/auth";
import { Toaster } from "sonner";
import { MapComponent } from "./app/map/MapComponent";
import {
  ProfileEditor,
  TileView,
  PeopleNearby,
  ProfilePage,
  ProfileDrawer,
  ProfileModal,
} from "./app/profile";
import { Id } from "../convex/_generated/dataModel";
import { MessagingArea } from "./app/chat/MessagingArea";
import { ThemeToggleButton } from "./components/common/ThemeToggleButton";
import { BottomNav } from "./components/common/BottomNav";
import { Sheet, SheetContent } from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import { User, Map, MessageCircle, Users, Pencil } from "lucide-react";

// Unified navigation items
const NAV_ITEMS = [
  { key: "map", label: "Map", icon: <Map className="w-5 h-5" /> },
  { key: "people", label: "People", icon: <Users className="w-5 h-5" /> },
  { key: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  { key: "chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
] as const;

type NavTab = "map" | "people" | "profile" | "chat";

// Add a responsive hook for mobile detection
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

interface SelectedConversationDetails {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export default function App() {
  const { isLoading } = useConvexAuth();
  const currentUserProfile = useQuery(api.profiles.getMyProfileWithAvatarUrl);
  const currentUserId = useQuery(api.users.getMyId);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

  const [activeTab, setActiveTab] = useState<NavTab>("map");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<Id<"users"> | null>(
    null
  );
  const [selectedConversationDetails, setSelectedConversationDetails] =
    useState<SelectedConversationDetails | null>(null);

  // Add a responsive hook for mobile detection
  const isMobile = useIsMobile();

  // Sheet for mobile overlays
  React.useEffect(() => {
    setSheetOpen(activeTab === "profile" || activeTab === "chat");
  }, [activeTab]);

  // Handle starting a chat with a specific user
  const handleStartChat = async (otherUserId: Id<"users">) => {
    try {
      const result = await getOrCreateConversationMutation({
        otherParticipantUserId: otherUserId,
      });
      setSelectedConversationDetails({
        conversationId: result.conversationId,
        otherParticipant: result.otherParticipant,
      });
      setActiveTab("chat");
      setViewingProfileId(null); // Close profile modal if open
    } catch (error) {
      console.error("Failed to start chat:", error);
      // Fallback to just navigating to chat
      setActiveTab("chat");
    }
  };

  // Handle selecting a conversation from the conversation list
  const handleSelectConversation = (
    conversationId: Id<"conversations">,
    otherParticipant: SelectedConversationDetails["otherParticipant"]
  ) => {
    setSelectedConversationDetails({ conversationId, otherParticipant });
  };

  // Handle going back to conversation list
  const handleBackToConversationList = () => {
    setSelectedConversationDetails(null);
  };

  // Main content for each tab
  const renderContent = () => {
    const safeProfile = currentUserProfile ?? null;
    const safeUserId = currentUserId ?? null;

    switch (activeTab) {
      case "map":
        return (
          <MapComponent
            currentUserProfileForMap={currentUserProfile ?? null}
            currentUserId={safeUserId}
            onStartChat={handleStartChat}
            onProfileClick={(userId) => setViewingProfileId(userId)}
          />
        );
      case "people":
        return (
          <PeopleNearby
            currentUserProfileForMap={currentUserProfile ?? null}
            currentUserId={safeUserId}
            onStartChat={handleStartChat}
            onProfileClick={(userId) => setViewingProfileId(userId)}
          />
        );
      case "profile":
        return <ProfileEditor />;
      case "chat":
        return (
          <MessagingArea
            currentUserId={safeUserId as Id<"users">}
            selectedConversationDetails={selectedConversationDetails}
            onSelectConversation={handleSelectConversation}
            onBackToConversationList={handleBackToConversationList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card/80 sticky top-0 z-30">
        <span className="text-xl font-bold text-primary">piggies</span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <SignOutButton />
        </div>
      </header>
      <Authenticated>
        <div className="flex flex-1 min-h-0">
          {/* Sidebar for desktop */}
          <nav className="hidden md:flex flex-col w-56 bg-card border-r py-6 px-2 gap-2">
            {/* Profile section */}
            <div className="mb-6">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                <img
                  src={
                    currentUserProfile?.avatarUrl ||
                    loggedInUser?.imageUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserProfile?.displayName || loggedInUser?.name || "U")}&background=8b5cf6&color=fff&size=128`
                  }
                  alt="Profile Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow"
                />
                <div className="text-base font-semibold text-primary text-center truncate w-full">
                  {currentUserProfile?.displayName ||
                    loggedInUser?.name ||
                    "Anonymous"}
                </div>
                {currentUserProfile?.status && (
                  <div className="text-xs text-muted-foreground text-center w-full truncate">
                    {currentUserProfile.status}
                  </div>
                )}
              </div>
            </div>
            {/* Navigation buttons */}
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.key}
                variant={activeTab === item.key ? "default" : "ghost"}
                className="flex items-center gap-3 justify-start w-full"
                aria-label={item.label}
                onClick={() => setActiveTab(item.key as NavTab)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
          {/* Main content area */}
          <main className="flex-1 flex flex-col items-stretch p-0 md:p-6 bg-muted/50">
            {/* Mobile sheet overlays for chat */}
            <Sheet open={sheetOpen && isMobile} onOpenChange={setSheetOpen}>
              <SheetContent
                side="bottom"
                className="max-h-[80vh] p-0 bg-card/95"
              >
                {activeTab === "chat" && (
                  <MessagingArea
                    currentUserId={currentUserId as Id<"users">}
                    selectedConversationDetails={selectedConversationDetails}
                    onSelectConversation={handleSelectConversation}
                    onBackToConversationList={handleBackToConversationList}
                  />
                )}
                {activeTab === "profile" && <ProfileEditor />}
              </SheetContent>
            </Sheet>
            {/* Main content (desktop or mobile map/people) */}
            <div className="flex-1 w-full h-full">
              {(!isMobile || activeTab === "map" || activeTab === "people") &&
                renderContent()}
            </div>
          </main>
        </div>
        {/* Bottom nav for mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 border-t flex justify-around items-center h-16 shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.key}
              variant={activeTab === item.key ? "default" : "ghost"}
              size="icon"
              aria-label={item.label}
              onClick={() => setActiveTab(item.key as NavTab)}
              className="flex flex-col items-center gap-0"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </nav>
        {/* ProfileModal */}
        <ProfileModal
          open={!!viewingProfileId}
          onOpenChange={(open) => {
            setProfileDrawerOpen(open);
            if (!open) setViewingProfileId(null);
          }}
          userId={viewingProfileId as Id<"users">}
          onBack={() => setViewingProfileId(null)}
          onStartChat={handleStartChat}
          currentUserProfileForMap={currentUserProfile ?? null}
        />
      </Authenticated>
      <Unauthenticated>
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md mx-auto shadow-xl border bg-card/90 p-8 rounded-lg">
            <h2 className="text-3xl md:text-4xl text-primary font-bold mb-2 text-center">
              Welcome!
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Sign in to see the map and connect.
            </p>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      <Toaster richColors position="top-right" />
    </div>
  );
}
