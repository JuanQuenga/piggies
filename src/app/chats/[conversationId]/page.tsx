"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { ChatView } from "../ChatView";

export default function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">
            You need to be signed in to view this conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatView
      conversationId={params.conversationId as any}
      otherParticipant={{ _id: "" as any, displayName: null, avatarUrl: null }}
      currentUserId={"" as any}
      onBack={() => {}}
    />
  );
}
