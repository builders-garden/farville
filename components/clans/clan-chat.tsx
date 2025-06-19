import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, MoreVertical, RefreshCw } from "lucide-react";
import { useClanChat } from "@/hooks/use-clan-chat";
import { useGame } from "@/context/GameContext";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";
import { Card, CardContent } from "../ui/card";
import { ClanChatMessageWithUser } from "@/lib/prisma/types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ClanChatProps {
  clanId: string;
}

interface MessageProps {
  message: ClanChatMessageWithUser;
  onDelete: (messageId: string) => void;
  canDelete: boolean;
  isOwnMessage: boolean;
}

const Message: React.FC<MessageProps> = ({
  message,
  onDelete,
  canDelete,
  isOwnMessage,
}) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div
      className={`flex gap-3 p-3 hover:bg-white/5 group ${
        isOwnMessage ? "bg-blue-500/10" : ""
      }`}
    >
      <LeaderboardUserAvatar
        pfpUrl={message.user.selectedAvatarUrl || message.user.avatarUrl || ""}
        username={message.user.username}
        isOgUser={message.user.mintedOG}
        size={{ width: 8, height: 8 }}
        borderSize={1}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white/90 text-sm font-medium">
            {message.user.displayName || message.user.username}
          </span>
          <span className="text-white/50 text-xs">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <p className="text-white/80 text-sm break-words">{message.message}</p>
      </div>
      {canDelete && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(message.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export const ClanChat: React.FC<ClanChatProps> = ({ clanId }) => {
  const { state } = useGame();
  const {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    isSending,
    refetch,
  } = useClanChat(clanId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const canDeleteMessage = (message: ClanChatMessageWithUser) => {
    if (!state.user || !state.clan) return false;

    // User can delete their own messages
    if (message.user.fid === state.user.fid) return true;

    // Leaders and officers can delete any message
    return state.clan.role === "leader" || state.clan.role === "officer";
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none h-96 w-full flex flex-col">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-white/70">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none h-96 flex flex-col w-full">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white/90 font-semibold text-sm">Clan Chat</h3>
          <Button
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/50 text-sm text-center">
                <p>No messages yet.</p>
                <p>Be the first to say hello! 👋</p>
              </div>
            </div>
          ) : (
            <>
              {/* Load More Messages Button */}
              <div className="p-3 text-center">
                <Button
                  onClick={loadMoreMessages}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Load older messages
                </Button>
              </div>

              {/* Messages */}
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onDelete={handleDeleteMessage}
                  canDelete={canDeleteMessage(message)}
                  isOwnMessage={message.user.fid === state.user?.fid}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type..."
              maxLength={500}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
              disabled={isSending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-white/40 text-xs mt-1">
            {newMessage.length}/500 characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
