"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Popup } from "../../components/ui/popup";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  File,
  X,
  ArrowLeft,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";

interface ChatViewProps {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  currentUserId: Id<"users">;
  onBack: () => void;
}

type MessageWithAuthorAndUrl = Doc<"messages"> & {
  author: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  attachmentUrl?: string | null;
};

// Helper function to extract YouTube Video ID from various URL formats
const getYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const ChatView: React.FC<ChatViewProps> = ({
  conversationId,
  otherParticipant,
  currentUserId,
  onBack,
}) => {
  const {
    results: messages,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.messages.listMessages,
    { conversationId },
    { initialNumItems: 20 }
  );

  const [newMessageText, setNewMessageText] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const generateUploadUrlMutation = useMutation(
    api.messages.generateMessageAttachmentUploadUrl
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!newMessageText.trim() && !attachmentFile) return;
    setIsSending(true);

    try {
      let body = newMessageText.trim();
      let format: "text" | "image" | "video" = "text";

      if (attachmentFile) {
        const uploadUrl = await generateUploadUrlMutation({});
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": attachmentFile.type },
          body: attachmentFile,
        });
        if (!response.ok)
          throw new Error(`Upload failed: ${await response.text()}`);
        const { storageId } = await response.json();
        body = storageId;
        if (attachmentFile.type.startsWith("image/")) format = "image";
        else if (attachmentFile.type.startsWith("video/")) format = "video";
        else {
          toast.error("Unsupported file type.");
          setIsSending(false);
          return;
        }
      }

      if (!body && format === "text") {
        if (!attachmentFile) {
          setIsSending(false);
          return;
        }
      }

      await sendMessageMutation({
        receiverId: otherParticipant._id,
        body,
        format,
      });

      setNewMessageText("");
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(format === "text" ? "Message sent!" : "File sent!");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        `Failed to send: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large (max 10MB).");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setAttachmentFile(file);
    }
  };

  const otherParticipantAvatar =
    otherParticipant.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.displayName || "U")}&background=random&size=32`;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center p-3 border-b border-border bg-muted/50">
        <Button onClick={onBack} variant="ghost" size="sm" className="mr-2">
          &larr; Back
        </Button>
        <img
          src={otherParticipantAvatar}
          alt={otherParticipant.displayName || "User"}
          className="w-8 h-8 rounded-full object-cover mr-2"
        />
        <h3 className="text-md font-semibold text-foreground">
          {otherParticipant.displayName || "Chat"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {status === "CanLoadMore" && (
          <Button
            onClick={() => loadMore(10)}
            variant="link"
            size="sm"
            className="w-full"
          >
            Load older messages
          </Button>
        )}
        {(messages as MessageWithAuthorAndUrl[])
          .slice()
          .reverse()
          .map((msg) => {
            const isCurrentUser = msg.authorId === currentUserId;
            const authorAvatar =
              msg.author.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author.displayName || "U")}&background=random&size=24`;
            const youtubeVideoId =
              msg.format === "text" ? getYoutubeVideoId(msg.body) : null;

            return (
              <div
                key={msg._id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isCurrentUser && (
                    <img
                      src={authorAvatar}
                      alt="author"
                      className="w-6 h-6 rounded-full object-cover mr-2 self-start"
                    />
                  )}
                  <div
                    className={`p-2 rounded-lg shadow ${isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none border"}`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-semibold mb-0.5 text-primary">
                        {msg.author.displayName}
                      </p>
                    )}
                    {youtubeVideoId ? (
                      <div className="aspect-video w-full max-w-xs">
                        <iframe
                          className="w-full h-full rounded"
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : msg.format === "text" ? (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.body}
                      </p>
                    ) : msg.format === "image" && msg.attachmentUrl ? (
                      <img
                        src={msg.attachmentUrl}
                        alt="Sent image"
                        className="max-w-full h-auto rounded-md my-1 max-h-64"
                      />
                    ) : msg.format === "video" && msg.attachmentUrl ? (
                      <video
                        src={msg.attachmentUrl}
                        controls
                        className="max-w-full h-auto rounded-md my-1 max-h-64"
                      />
                    ) : null}
                    <p
                      className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"} text-right`}
                    >
                      {new Date(msg._creationTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
        {status === "LoadingFirstPage" && (
          <p className="text-center text-muted-foreground">
            Loading messages...
          </p>
        )}
      </div>

      <div className="p-3 border-t border-border bg-background">
        {attachmentFile && (
          <div className="text-xs text-muted-foreground mb-1">
            Selected: {attachmentFile.name} (
            {(attachmentFile.size / 1024).toFixed(1)} KB)
            <Button
              onClick={() => {
                setAttachmentFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              variant="link"
              size="sm"
              className="ml-2 text-destructive h-auto p-0"
            >
              [remove]
            </Button>
          </div>
        )}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="p-2 rounded-full hover:bg-muted cursor-pointer text-muted-foreground"
          >
            📎
          </label>
          <Input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type a message or paste a YouTube link..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={isSending || (!newMessageText.trim() && !attachmentFile)}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
