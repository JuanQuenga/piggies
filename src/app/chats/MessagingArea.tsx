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
import { Send, ArrowLeft, MessageCircle, Clock, User } from "lucide-react";
import { cn } from "../../lib/utils";

interface MessagingAreaProps {
  conversationId: Id<"conversations"> | null;
  otherParticipant: {
    _id: Id<"users">;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
  currentUserId: Id<"users"> | null | undefined;
  onBack: () => void;
  isMobile: boolean;
}

export const MessagingArea: React.FC<MessagingAreaProps> = ({
  conversationId,
  otherParticipant,
  currentUserId,
  onBack,
  isMobile,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const { results: messages, status } = usePaginatedQuery(
    api.messages.listMessages,
    conversationId && currentUserId
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
    if (conversationId) {
      inputRef.current?.focus();
    }
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (
      !message.trim() ||
      !conversationId ||
      !currentUserId ||
      !otherParticipant
    )
      return;

    setIsSending(true);
    try {
      await sendMessage({
        senderId: currentUserId,
        receiverId: otherParticipant._id,
        content: message.trim(),
        format: "text",
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Select a conversation
          </h3>
          <p className="text-zinc-400">
            Choose a conversation from the list to start chatting
          </p>
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
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-2 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Button>
        )}
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
                    "flex gap-3",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* <img
                    src={senderAvatar}
                    alt={msg.author?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover border-2 border-zinc-600 flex-shrink-0"
                  /> */}
                  <div
                    className={cn(
                      "max-w-[70%]",
                      isOwnMessage ? "text-right" : "text-left"
                    )}
                  >
                    <Card
                      className={cn(
                        "inline-block rounded-lg",
                        isOwnMessage
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-zinc-100 border-zinc-700 "
                      )}
                    >
                      <CardContent className="p-3">
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
        <div className="flex gap-2">
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
            disabled={!message.trim() || isSending}
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
