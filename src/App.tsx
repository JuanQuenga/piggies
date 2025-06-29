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
import { MapComponent } from "./app/map";
import { ProfileEditor, TileView, PeopleNearby } from "./app/profile";
import { Id, Doc } from "../convex/_generated/dataModel";
import { MessagingArea } from "./app/chat";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { ThemeToggleButton } from "./components/common";
import { LogOut, Map, LayoutGrid } from "lucide-react";
import { Sheet, SheetContent } from "./components/ui/sheet";
import { BottomNav } from "./components/common/BottomNav";

interface UserMarkerDisplayData {
  _id: Id<"profiles">;
  latitude?: number;
  longitude?: number;
  status?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
  description?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  lastSeen?: number | null;
  isVisible?: boolean;
  userId: Id<"users">;
}

interface OtherParticipant {
  _id: Id<"users">;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface SelectedConversationDetails {
  conversationId: Id<"conversations">;
  otherParticipant: OtherParticipant;
}

interface AuthenticatedContentProps {
  isLoading: boolean;
  currentUserProfile: any;
  currentUserId: Id<"users"> | null | undefined;
  loggedInUser: any;
  activeTab: "profile" | "chat" | "people";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"profile" | "chat" | "people">
  >;
  viewMode: "map" | "tiles";
  setViewMode: React.Dispatch<React.SetStateAction<"map" | "tiles">>;
  selectedConversationDetails: SelectedConversationDetails | null;
  setSelectedConversationDetails: React.Dispatch<
    React.SetStateAction<SelectedConversationDetails | null>
  >;
  handleStartOrSelectConversation: (
    details:
      | {
          conversationId: Id<"conversations">;
          otherParticipant: OtherParticipant;
        }
      | { otherParticipantUserId: Id<"users"> }
  ) => Promise<void>;
  handleViewChatList: () => void;
  handleBackToConversationList: () => void;
  currentUserProfileForMap: UserMarkerDisplayData | null;
}

interface MobileMapContentProps {
  currentUserProfileForMap: UserMarkerDisplayData | null;
  currentUserId: Id<"users"> | null | undefined;
  onStartChat: (otherParticipantUserId: Id<"users">) => void;
}

export default function App() {
  const { isLoading } = useConvexAuth();
  const currentUserProfile = useQuery(api.profiles.getMyProfile);
  const currentUserId = useQuery(api.users.getMyId);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const [activeTab, setActiveTab] = React.useState<
    "profile" | "chat" | "people"
  >("people");
  const [viewMode, setViewMode] = React.useState<"map" | "tiles">("map");
  const [selectedConversationDetails, setSelectedConversationDetails] =
    React.useState<SelectedConversationDetails | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = React.useState<
    "map" | "profile" | "chat"
  >("map");
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const getOrCreateConversationMutation = useMutation(
    api.messages.getOrCreateConversationWithParticipant
  );

  React.useEffect(() => {
    if (mobileActiveTab === "profile" || mobileActiveTab === "chat") {
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
    }
  }, [mobileActiveTab]);

  const handleMobileTab = (tab: "map" | "profile" | "chat") => {
    if (tab === "map") {
      setSheetOpen(false);
      setMobileActiveTab("map");
    } else {
      setMobileActiveTab(tab);
    }
  };

  const handleStartOrSelectConversation = async (
    details:
      | {
          conversationId: Id<"conversations">;
          otherParticipant: OtherParticipant;
        }
      | { otherParticipantUserId: Id<"users"> }
  ): Promise<void> => {
    if ("conversationId" in details) {
      setSelectedConversationDetails({
        conversationId: details.conversationId,
        otherParticipant: details.otherParticipant,
      });
      setActiveTab("chat");
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setMobileActiveTab("chat");
        setSheetOpen(true);
      }
    } else {
      if (!currentUserId) {
        toast.error("Could not verify user identity to start a chat.");
        return;
      }
      if (currentUserId === details.otherParticipantUserId) {
        toast.info("You cannot start a chat with yourself.");
        return;
      }
      try {
        const result = await getOrCreateConversationMutation({
          otherParticipantUserId: details.otherParticipantUserId,
        });
        setSelectedConversationDetails(result as SelectedConversationDetails);
        setActiveTab("chat");
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setMobileActiveTab("chat");
          setSheetOpen(true);
        }
      } catch (error) {
        console.error("Failed to start conversation:", error);
        toast.error(
          `Failed to start chat: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  };

  const handleViewChatList = () => {
    setSelectedConversationDetails(null);
    setActiveTab("chat");
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileActiveTab("chat");
      setSheetOpen(true);
    }
  };

  const handleBackToConversationList = () => {
    setSelectedConversationDetails(null);
  };

  const currentUserProfileForMap: UserMarkerDisplayData | null =
    currentUserProfile && currentUserId
      ? {
          _id: currentUserProfile._id,
          userId: currentUserId,
          latitude: currentUserProfile.latitude,
          longitude: currentUserProfile.longitude,
          status: currentUserProfile.status,
          avatarUrl:
            currentUserProfile.avatarUrl || loggedInUser?.image || undefined,
          displayName: currentUserProfile.displayName || loggedInUser?.name,
          description: currentUserProfile.description,
          userName: loggedInUser?.name,
          userEmail: loggedInUser?.email,
          lastSeen: currentUserProfile.lastSeen,
          isVisible: currentUserProfile.isVisible,
        }
      : null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      {/* Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-accent via-primary to-primary w-full" />
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md h-16 flex justify-between items-center border-b border-border shadow-sm px-4 md:px-6">
        <h2 className="text-xl font-bold text-primary tracking-tight">
          piggies
        </h2>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 flex flex-col bg-muted/50">
        <Authenticated>
          {/* Desktop: show full layout. Mobile: show only map and nav. */}
          <div className="hidden md:block h-full">
            <AuthenticatedContent
              isLoading={isLoading}
              currentUserProfile={currentUserProfile}
              currentUserId={currentUserId}
              loggedInUser={loggedInUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedConversationDetails={selectedConversationDetails}
              setSelectedConversationDetails={setSelectedConversationDetails}
              handleStartOrSelectConversation={handleStartOrSelectConversation}
              handleViewChatList={handleViewChatList}
              handleBackToConversationList={handleBackToConversationList}
              currentUserProfileForMap={currentUserProfileForMap}
            />
          </div>
          {/* Mobile only: Sheet for Profile/Chat */}
          <div className="block md:hidden relative h-full w-full flex-1">
            {/* Map fullscreen on mobile */}
            <div className="absolute inset-0 z-0">
              <MobileMapContent
                currentUserProfileForMap={currentUserProfileForMap}
                currentUserId={currentUserId}
                onStartChat={(otherParticipantUserId: Id<"users">) => {
                  handleStartOrSelectConversation({
                    otherParticipantUserId,
                  }).catch(console.error);
                }}
              />
            </div>
            <Sheet
              open={sheetOpen}
              onOpenChange={(open) => {
                setSheetOpen(open);
                if (!open) setMobileActiveTab("map");
              }}
            >
              <SheetContent
                side="bottom"
                className="max-h-[80vh] p-0 bg-card/95 backdrop-blur-md shadow-2xl border-t border-border"
              >
                {mobileActiveTab === "profile" && <ProfileEditor />}
                {mobileActiveTab === "chat" && (
                  <MessagingArea
                    currentUserId={currentUserId as Id<"users">}
                    selectedConversationDetails={selectedConversationDetails}
                    onSelectConversation={(
                      convId: Id<"conversations">,
                      otherP: OtherParticipant
                    ) => {
                      handleStartOrSelectConversation({
                        conversationId: convId,
                        otherParticipant: otherP,
                      }).catch(console.error);
                    }}
                    onBackToConversationList={handleBackToConversationList}
                  />
                )}
              </SheetContent>
            </Sheet>
            {/* Bottom Navigation */}
            <BottomNav
              activeTab={mobileActiveTab}
              setActiveTab={handleMobileTab}
            />
          </div>
        </Authenticated>
        <Unauthenticated>
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <Card className="w-full max-w-md mx-auto shadow-xl border border-border bg-card/90">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl text-primary">
                  Welcome!
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to see the map and connect.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignInForm />
              </CardContent>
            </Card>
          </div>
        </Unauthenticated>
      </main>
      {/* Toaster for notifications */}
      <div className="z-50">
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}

function AuthenticatedContent(
  props: AuthenticatedContentProps
): React.JSX.Element {
  const {
    isLoading,
    currentUserProfile,
    currentUserId,
    loggedInUser,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    selectedConversationDetails,
    setSelectedConversationDetails,
    handleStartOrSelectConversation,
    handleViewChatList,
    handleBackToConversationList,
    currentUserProfileForMap,
  } = props;

  if (
    isLoading ||
    currentUserId === undefined ||
    currentUserProfile === undefined
  ) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        <p className="ml-3 text-muted-foreground">Loading your experience...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-4 max-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="sidebar-custom w-full md:w-1/4 lg:w-1/5 order-2 md:order-1 flex flex-col bg-card/80 border-t md:border-t-0 md:border-l border-border border-r-2 border-r-muted-foreground shadow-xl backdrop-blur-lg z-10 min-h-[400px]">
        <Card className="bg-card/90 shadow-lg border-none m-4">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold mb-1">
              Hello,{" "}
              {currentUserProfile?.displayName ||
                loggedInUser?.name ||
                loggedInUser?.email ||
                "User"}
              !
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-normal mt-0">
              Share your location and complete your profile to become visible on
              the map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Profile/Chats Toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setActiveTab("people")}
                variant={activeTab === "people" ? "default" : "outline"}
                size="sm"
                className={`flex-1 rounded-l-none sidebar-toggle-btn ${activeTab === "people" ? "active" : ""}`}
              >
                People Nearby
              </Button>
              <Button
                onClick={() => setActiveTab("profile")}
                variant={activeTab === "profile" ? "default" : "outline"}
                size="sm"
                className={`flex-1 sidebar-toggle-btn ${activeTab === "profile" ? "active" : ""}`}
              >
                Profile
              </Button>
              <Button
                onClick={handleViewChatList}
                variant={activeTab === "chat" ? "default" : "outline"}
                size="sm"
                className={`flex-1 rounded-r-none sidebar-toggle-btn ${activeTab === "chat" ? "active" : ""}`}
              >
                Chats
              </Button>
            </div>
            {/* Optionally, add a summary or quick profile info here */}
          </CardContent>
        </Card>
      </aside>
      {/* Main Content (Profile, Chat, or People Nearby) */}
      <section className="w-full md:w-3/4 lg:w-4/5 order-1 md:order-2 flex flex-col items-stretch justify-stretch p-2 md:p-4">
        <div className="flex-1 rounded-xl border border-border bg-card/80 shadow-2xl overflow-hidden">
          {activeTab === "profile" ? (
            <ProfileEditor />
          ) : activeTab === "chat" ? (
            <MessagingArea
              currentUserId={currentUserId}
              selectedConversationDetails={selectedConversationDetails}
              onSelectConversation={(convId, otherP) => {
                handleStartOrSelectConversation({
                  conversationId: convId,
                  otherParticipant: otherP,
                }).catch(console.error);
              }}
              onBackToConversationList={handleBackToConversationList}
            />
          ) : (
            <PeopleNearby
              viewMode={viewMode}
              setViewMode={setViewMode}
              currentUserProfileForMap={currentUserProfileForMap}
              currentUserId={currentUserId}
              onStartChat={(otherParticipantUserId: Id<"users">) => {
                handleStartOrSelectConversation({
                  otherParticipantUserId,
                }).catch(console.error);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function MobileMapContent({
  currentUserProfileForMap,
  currentUserId,
  onStartChat,
}: MobileMapContentProps): React.JSX.Element {
  return (
    <MapComponent
      currentUserProfileForMap={currentUserProfileForMap}
      currentUserId={currentUserId}
      onStartChat={onStartChat}
    />
  );
}

export {};
