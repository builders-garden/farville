import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, MoreVertical } from "lucide-react";
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

  // Generate a consistent color for each user based on their username
  const getUsernameColor = (username: string) => {
    const colors = [
      "text-red-300",
      "text-blue-300",
      "text-green-300",
      "text-yellow-300",
      "text-purple-300",
      "text-pink-300",
      "text-indigo-300",
      "text-cyan-300",
      "text-orange-300",
      "text-lime-300",
    ];
    const hash = username
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      className={`flex gap-2 px-3 py-1 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar for others (left side) - aligned with bubble corner */}
      {!isOwnMessage && (
        <div className="flex-shrink-0 self-end mb-1">
          <LeaderboardUserAvatar
            pfpUrl={
              message.user.selectedAvatarUrl || message.user.avatarUrl || ""
            }
            username={message.user.username}
            isOgUser={message.user.mintedOG}
            size={{ width: 8, height: 8 }}
            borderSize={1}
          />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[75%] ${
          isOwnMessage ? "items-end" : "items-start"
        } flex flex-col`}
      >
        {/* Message content */}
        <div
          className={`relative rounded-2xl px-3 py-2 ${
            isOwnMessage
              ? "bg-yellow-600/80 text-white rounded-br-md"
              : "bg-white/15 text-white/90 rounded-bl-md"
          }`}
        >
          {/* Username inside bubble (only for others) */}
          {!isOwnMessage && (
            <div className="mb-1">
              <span
                className={`text-[10px] font-medium ${getUsernameColor(
                  message.user.username
                )}`}
              >
                {message.user.displayName || message.user.username}
              </span>
            </div>
          )}

          <p className="text-xs break-words leading-relaxed mb-1">
            {message.message}
          </p>

          {/* Time and actions row */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[9px] ${
                isOwnMessage ? "text-white/60" : "text-white/40"
              }`}
            >
              {formatTime(message.createdAt)}
            </span>
            {canDelete && (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#5B4120] border-white/20"
                  >
                    <DropdownMenuItem
                      onClick={() => onDelete(message.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar for own messages (right side) - aligned with bubble corner */}
      {isOwnMessage && (
        <div className="flex-shrink-0 self-end mb-1">
          <LeaderboardUserAvatar
            pfpUrl={
              message.user.selectedAvatarUrl || message.user.avatarUrl || ""
            }
            username={message.user.username}
            isOgUser={message.user.mintedOG}
            size={{ width: 8, height: 8 }}
            borderSize={1}
          />
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
        <div className="p-3 border-b border-white/10">
          <h3 className="text-white/90 font-semibold text-sm">Feud Chat</h3>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#5B4120] [&::-webkit-scrollbar-thumb]:bg-yellow-600/60 [&::-webkit-scrollbar-thumb:hover]:bg-yellow-600/80"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/50 text-xs text-center">
                <p>No messages yet.</p>
                <p>Be the first to say hello! 👋</p>
              </div>
            </div>
          ) : (
            <>
              {/* Load More Messages Button */}
              <div className="p-2 text-center">
                <Button
                  onClick={loadMoreMessages}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 text-xs hover:text-white hover:bg-white/10 transition-colors"
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
        <div className="p-3 border-t border-white/10">
          <form
            onSubmit={handleSendMessage}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent"
              disabled={isSending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              size="sm"
              className="bg-yellow-600 text-white rounded-full h-8 w-8 p-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>
          <div className="text-white/40 text-[10px] mt-1 text-center">
            {newMessage.length}/500 characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
