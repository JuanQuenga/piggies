"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Send,
  ArrowLeft,
  MessageCircle,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ChatViewProps {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  currentUserId: Id<"users"> | null | undefined;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversationId,
  otherParticipant,
  currentUserId,
  onBack,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const generateUploadUrl = useMutation(
    api.messages.generateMessageAttachmentUploadUrl
  );
  const { results: messages, status } = usePaginatedQuery(
    api.messages.listMessages,
    currentUserId
      ? {
          conversationId,
          currentUserId,
        }
      : "skip",
    { initialNumItems: 50 }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if ((!message.trim() && !imageFile) || !currentUserId) return;
    setIsSending(true);
    try {
      let content = message.trim();
      let format: "text" | "image" = "text";
      let storageId: string | undefined = undefined;
      if (imageFile) {
        // Validate file size
        if (imageFile.size > 5 * 1024 * 1024) {
          alert("Image too large (max 5MB)");
          setIsSending(false);
          return;
        }
        // Get upload URL
        const uploadUrl = await generateUploadUrl({ userId: currentUserId });
        // Upload image
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!uploadRes.ok) {
          alert("Image upload failed");
          setIsSending(false);
          return;
        }
        const { storageId: uploadedStorageId } = await uploadRes.json();
        storageId = uploadedStorageId;
        format = "image";
        content = "";
      }
      await sendMessage({
        senderId: currentUserId,
        receiverId: otherParticipant._id,
        content,
        format,
        storageId: storageId as any,
      });
      setMessage("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !imageFile) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large (max 5MB)");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  if (currentUserId === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-zinc-400">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Sign in required
          </h3>
          <p className="text-zinc-400">Please sign in to use messaging.</p>
        </div>
      </div>
    );
  }

  const avatar =
    otherParticipant.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.displayName || "U")}&background=8b5cf6&color=fff&size=40`;

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="p-2 hover:bg-zinc-800"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Button>
        <img
          src={avatar}
          alt={otherParticipant.displayName || "User"}
          className="w-8 h-8 rounded-full object-cover border-2 border-zinc-600"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {otherParticipant.displayName || "Unknown User"}
          </h3>
          <p className="text-xs text-zinc-400">Active now</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {status === "LoadingFirstPage" ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-zinc-400">
              Send a message to begin chatting with{" "}
              {otherParticipant.displayName || "this user"}
            </p>
          </div>
        ) : (
          messages
            .slice()
            .reverse()
            .map((msg) => {
              const isOwnMessage = msg.senderId === currentUserId;
              const senderAvatar =
                msg.author?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author?.name || "U")}&background=8b5cf6&color=fff&size=32`;
              return (
                <div
                  key={msg._id}
                  className={cn(
                    "flex items-end gap-2 mb-2",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <img
                    src={senderAvatar}
                    alt={msg.author?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover border-2 border-zinc-600 flex-shrink-0"
                  />
                  <div
                    className={cn(
                      "max-w-[70%] flex flex-col",
                      isOwnMessage ? "items-end" : "items-start"
                    )}
                  >
                    <Card
                      className={cn(
                        "inline-block rounded-lg px-4 py-2",
                        isOwnMessage
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-zinc-100 text-zinc-900 border-zinc-200"
                      )}
                    >
                      <CardContent className="p-0">
                        {msg.format === "image" && msg.attachmentUrl ? (
                          <img
                            src={msg.attachmentUrl}
                            alt="Sent image"
                            className="max-w-xs max-h-64 rounded-lg mb-2 mx-auto"
                          />
                        ) : null}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </CardContent>
                    </Card>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1 text-xs text-zinc-400",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      <span>
                        {new Date(msg._creationTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        {imagePreview && (
          <div className="mb-2 flex items-center gap-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover border border-zinc-700"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              ✕
            </Button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="p-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <ImageIcon className="w-5 h-5 text-purple-400" />
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
            disabled={isSending}
          />
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-purple-500"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!message.trim() && !imageFile) || isSending}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
