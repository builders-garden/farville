import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, MoreVertical } from "lucide-react";
import { useClanChat } from "@/hooks/use-clan-chat";
import { useGame } from "@/context/GameContext";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";
import { Card, CardContent } from "../ui/card";
import {
  ClanChatMessageWithUser,
  ClanRequestWithItemData,
  ClanMember,
} from "@/lib/prisma/types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RequestModal from "../RequestModal";
import Image from "next/image";
import InventoryItem from "@/components/InventoryItem";
import { Item } from "@prisma/client";
import { RequestItem } from "./clan-requests/request-item";
import { useCreateRequest } from "@/hooks/game-actions/use-create-request";
import { Mode } from "@/lib/types/game";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";

// Unified type for chat items (both messages and requests)
type ChatItem =
  | ({ type: "message" } & ClanChatMessageWithUser)
  | ({ type: "request" } & ClanRequestWithItemData & {
        user: ClanMember["user"];
      });

interface ClanChatProps {
  clanId: string;
  requests?: (ClanRequestWithItemData & { user: ClanMember["user"] })[];
  refetchClanData?: () => void;
}

interface RequestMessageProps {
  request: ClanRequestWithItemData & { user: ClanMember["user"] };
  viewerFid: number;
  refetchClanData?: () => void;
}

const RequestMessage: React.FC<RequestMessageProps> = ({
  request,
  viewerFid,
  refetchClanData,
}) => {
  const { state } = useGame();
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Defensive checks to prevent crashes - after hooks
  if (
    !request ||
    !state ||
    request.request?.quantity === request.request?.filledQuantity
  ) {
    return null;
  }

  const isOwn = request.fid === viewerFid;

  const itemData = request.itemId
    ? state.items?.find((item) => item.id === request.itemId)
    : request.request?.item;

  const requestData = request.request;
  const requestFulfilled = requestData
    ? requestData.filledQuantity >= requestData.quantity
    : false;

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid date";
    }
  };

  // Generate a consistent color for each user based on their username
  const getUsernameColor = (username: string) => {
    try {
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

      if (!username || typeof username !== "string") {
        return colors[0]; // Default to first color
      }

      const hash = username
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    } catch (error) {
      console.error("Error generating username color:", error);
      return "text-white"; // Safe fallback
    }
  };

  if (!itemData || !request.user) {
    return null; // Don't render if item data is missing
  }

  return (
    <>
      <div
        className={`flex gap-2 px-3 py-1 ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        {/* Avatar for others (left side) */}
        {!isOwn && (
          <div className="flex-shrink-0 self-end mb-1">
            <LeaderboardUserAvatar
              pfpUrl={
                request.user.selectedAvatarUrl || request.user.avatarUrl || ""
              }
              username={request.user.username || "Unknown"}
              isOgUser={request.user.mintedOG || false}
              size={{ width: 8, height: 8 }}
              borderSize={1}
            />
          </div>
        )}

        {/* Request bubble */}
        <div
          className={`max-w-[75%] ${
            isOwn ? "items-end" : "items-start"
          } flex flex-col`}
        >
          {/* Request content */}
          <div
            className={`relative rounded-2xl px-3 py-2 ${
              isOwn
                ? "bg-yellow-600/80 text-white rounded-br-md"
                : "bg-white/15 text-white/90 rounded-bl-md"
            }`}
          >
            {/* Username inside bubble (only for others) */}
            {!isOwn && (
              <div className="mb-2">
                <span
                  className={`text-[9px] font-medium ${getUsernameColor(
                    request.user.username
                  )}`}
                >
                  {request.user.displayName || request.user.username}
                </span>
              </div>
            )}

            {/* Request content */}
            <div className="flex flex-row items-center gap-2 mb-2">
              <Image
                src={
                  itemData.icon
                    ? `/images/${itemData.icon}`
                    : "/images/default-item.png"
                }
                alt={itemData.name || "Item"}
                width={32}
                height={32}
                className="rounded flex-shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                {requestData ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-medium text-white truncate">
                        {itemData.name}
                      </span>
                      <span className="text-[9px] text-white/80 ml-1">
                        ({requestData.filledQuantity}/{requestData.quantity})
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                      <div
                        className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (requestData.filledQuantity /
                              requestData.quantity) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <span className="text-[9px] text-white/90">
                    I need {request.quantity} {itemData.name}. Please help!
                  </span>
                )}
              </div>
            </div>

            {/* Time and Donate button row */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] ${
                  isOwn ? "text-white/60" : "text-white/40"
                }`}
              >
                {formatTime(request.createdAt)}
              </span>
              {!isOwn && !requestFulfilled && requestData && (
                <button
                  className="bg-yellow-500 text-white text-[9px] py-1 px-2 rounded hover:bg-yellow-600 transition-colors"
                  onClick={() => setShowRequestModal(true)}
                >
                  Donate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && request.requestId && (
        <RequestModal
          onClose={() => setShowRequestModal(false)}
          onDonationSuccess={() => {
            refetchClanData?.();
            setShowRequestModal(false);
          }}
          id={request.requestId}
        />
      )}
    </>
  );
};

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
  // Defensive check to prevent crashes
  if (!message || !message.user) {
    return null;
  }

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid date";
    }
  };

  // Generate a consistent color for each user based on their username
  const getUsernameColor = (username: string) => {
    try {
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

      if (!username || typeof username !== "string") {
        return colors[0]; // Default to first color
      }

      const hash = username
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    } catch (error) {
      console.error("Error generating username color:", error);
      return "text-white"; // Safe fallback
    }
  };

  return (
    <div
      className={`flex gap-2 px-3 py-1 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar for others (left side) - aligned with bubble corner */}
      {!isOwnMessage && message.user && (
        <div className="flex-shrink-0 self-end mb-1">
          <LeaderboardUserAvatar
            pfpUrl={
              message.user.selectedAvatarUrl || message.user.avatarUrl || ""
            }
            username={message.user.username || "Unknown"}
            isOgUser={message.user.mintedOG || false}
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
                className={`text-[9px] font-medium ${getUsernameColor(
                  message.user.username
                )}`}
              >
                {message.user.displayName || message.user.username}
              </span>
            </div>
          )}

          <p className="text-[9px] break-words leading-relaxed mb-1">
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
    </div>
  );
};

export const ClanChat: React.FC<ClanChatProps> = ({
  clanId,
  requests = [],
  refetchClanData,
}) => {
  const { state } = useGame();
  const { messages, isLoading, sendMessage, deleteMessage, isSending } =
    useClanChat(clanId, refetchClanData);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Request dialog states
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  // Request creation hooks
  const { mutate: createRequest } = useCreateRequest();
  const { shareRequestToClan } = useClanOperations();

  // Helper functions for request creation
  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const findUserItem = (itemSlug: string) => {
    const userItem = state.items.find((item) => item.slug === itemSlug);
    if (!userItem) return undefined;

    const userInventoryItem = [
      ...state.seeds,
      ...state.crops,
      ...state.perks,
    ].find((ui) => ui.item.slug === itemSlug);

    return userInventoryItem;
  };

  const renderCategorySection = (
    category: string,
    icon: string,
    title: string
  ) => {
    const filteredItems = state.items.filter(
      (item) => item.category === category
    );

    // Get the appropriate collection based on category
    const userItems =
      category === "seed"
        ? state.seeds
        : category === "crop"
        ? state.crops
        : category === "special-crop"
        ? state.specialCrops
        : state.perks;

    const isImageUrl = icon.startsWith("http") || icon.startsWith("/");

    return (
      <div key={category}>
        <h3 className="text-white/90 font-bold text-md mb-4 flex items-center gap-2">
          {isImageUrl ? (
            <Image src={icon} alt={title} width={28} height={28} />
          ) : (
            <span className="text-2xl mt-[-4px]">{icon}</span>
          )}
          {title}
        </h3>
        <div className="grid grid-cols-6 gap-4 md:grid-cols-8">
          {filteredItems.map((item) => {
            const userItem = userItems.find((ui) => ui.item.slug === item.slug);
            const quantity = userItem?.quantity || 0;

            return (
              <InventoryItem
                key={item.id}
                item={item}
                quantity={quantity}
                onClick={() => {
                  if (category !== "special-crop") {
                    handleItemClick(item);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const handleCreateRequest = () => {
    if (!selectedItem || !state.clan) return;

    try {
      createRequest(
        {
          itemId: selectedItem.id,
          quantity: requestQuantity,
          mode: Mode.Classic,
        },
        {
          onSuccess: async (data) => {
            console.log("Request created successfully");
            shareRequestToClan({
              requestId: data.id,
              // @ts-expect-error clanId is always defined
              clanId: state.clan.clanId,
            });
            setSelectedItem(null);
            setRequestQuantity(1);
            setIsRequestDialogOpen(false);
          },
          onError: (error) => {
            console.error("Error creating request:", error);
          },
        }
      );

      refetchClanData?.();
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  // Merge and sort messages and requests chronologically
  const chatItems: ChatItem[] = React.useMemo(() => {
    try {
      // Defensive checks for arrays
      const safeMessages = Array.isArray(messages) ? messages : [];
      const safeRequests = Array.isArray(requests) ? requests : [];

      const messageItems: ChatItem[] = safeMessages
        .filter((msg) => msg && msg.id) // Filter out invalid messages
        .map((msg) => ({
          type: "message" as const,
          ...msg,
        }));

      const requestItems: ChatItem[] = safeRequests
        .filter((req) => req && (req.id || req.requestId)) // Filter out invalid requests
        .map((req) => ({
          type: "request" as const,
          ...req,
        }));

      const allItems = [...messageItems, ...requestItems];
      return allItems.sort((a, b) => {
        try {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();

          // Handle invalid dates
          if (isNaN(aTime) && isNaN(bTime)) return 0;
          if (isNaN(aTime)) return 1;
          if (isNaN(bTime)) return -1;

          return aTime - bTime;
        } catch (error) {
          console.error("Error sorting chat items:", error);
          return 0;
        }
      });
    } catch (error) {
      console.error("Error creating chat items:", error);
      return [];
    }
  }, [messages, requests]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatItems]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    sendMessage(newMessage);
    setNewMessage("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      const previousHeight = textareaRef.current.style.height;
      textareaRef.current.style.height = "auto";
      const newHeight = textareaRef.current.scrollHeight + "px";
      textareaRef.current.style.height = newHeight;

      // If textarea height changed, keep chat scrolled to bottom
      if (previousHeight !== newHeight && messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSendMessage(formEvent);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const canDeleteMessage = (message: ClanChatMessageWithUser) => {
    try {
      if (!state.user || !state.clan || !message || !message.user) return false;

      // User can delete their own messages
      if (message.user.fid === state.user.fid) return true;

      // Leaders and officers can delete any message
      return state.clan.role === "leader" || state.clan.role === "officer";
    } catch (error) {
      console.error("Error checking message deletion permissions:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none h-[34rem] w-full flex flex-col">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-white/70">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  // Defensive check for critical state
  if (!state || !state.user) {
    return (
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none h-[34rem] w-full flex flex-col">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-white/70">
            Unable to load chat. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-[34rem] w-full">
      {/* Main Chat Container */}
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex flex-col h-full min-h-0">
          {/* Chat Header */}
          <div className="p-3 border-b border-white/10">
            <h3 className="text-white/90 font-semibold text-sm">Feud Chat</h3>
          </div>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 py-2 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#5B4120] [&::-webkit-scrollbar-thumb]:bg-yellow-600/60 [&::-webkit-scrollbar-thumb:hover]:bg-yellow-600/80"
          >
            {chatItems.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white/50 text-xs text-center">
                  <p>No messages yet.</p>
                  <p>Be the first to say hello! 👋</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Items (Messages and Requests) */}
                {chatItems.map((item, index) => {
                  try {
                    if (!item || !item.type) {
                      console.warn("Invalid chat item at index:", index);
                      return null;
                    }

                    if (item.type === "message") {
                      const message = item;
                      if (!message.id || !message.user) {
                        console.warn("Invalid message at index:", index);
                        return null;
                      }
                      return (
                        <Message
                          key={`message-${message.id}`}
                          message={message}
                          onDelete={handleDeleteMessage}
                          canDelete={canDeleteMessage(message)}
                          isOwnMessage={message.user.fid === state.user?.fid}
                        />
                      );
                    } else {
                      const request = item;
                      if (!request.fid) {
                        console.warn("Invalid request at index:", index);
                        return null;
                      }
                      // Create a more robust unique key for requests
                      const requestKey = `request-${
                        request.requestId ||
                        request.id ||
                        `${request.fid}-${request.itemId}-${index}`
                      }`;
                      return (
                        <RequestMessage
                          key={requestKey}
                          request={request}
                          viewerFid={state.user?.fid || 0}
                          refetchClanData={refetchClanData}
                        />
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Error rendering chat item at index:",
                      index,
                      error
                    );
                    return null;
                  }
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Input - Fixed to bottom */}
      <div className="pt-3">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type..."
            maxLength={500}
            rows={1}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-white text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent resize-none overflow-hidden min-h-[2.5rem] max-h-32"
            disabled={isSending}
          />

          {/* Show Send button when message is not empty, Request button when empty */}
          {newMessage.trim() ? (
            <Button
              type="submit"
              disabled={isSending}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-500 text-white rounded-full p-0 h-10 w-10 flex-shrink-0 transition-colors"
            >
              <Send className="h-3 w-3" />
            </Button>
          ) : (
            <Dialog
              open={isRequestDialogOpen}
              onOpenChange={setIsRequestDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-500 text-white rounded-full p-0 h-10 w-10 flex-shrink-0 transition-colors"
                >
                  <Image
                    src="/images/icons/tractor.png"
                    alt="Request"
                    width={20}
                    height={20}
                  />
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[360px] bg-[#7E4E31] border-[#8B5E3C]/50 rounded-lg p-4">
                <DialogHeader className="gap-2 mb-2">
                  <DialogTitle className="text-white/90">
                    Clan Requests
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-xs flex flex-col gap-2">
                    <span>Send a request to your clan for items you need.</span>
                    <span>Pick an item and specify the quantity you need.</span>
                  </DialogDescription>
                </DialogHeader>

                {!selectedItem ? (
                  <div className="flex flex-col gap-2 w-full mx-auto space-y-8">
                    {renderCategorySection("seed", "🌱", "Seeds")}
                    {renderCategorySection("crop", "🌾", "Crops")}
                  </div>
                ) : (
                  <RequestItem
                    item={selectedItem}
                    requestQuantity={requestQuantity}
                    setRequestQuantity={setRequestQuantity}
                    userItem={findUserItem(selectedItem.slug)}
                    handleRequest={handleCreateRequest}
                    onClose={() => {
                      setSelectedItem(null);
                      setRequestQuantity(1);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </form>
      </div>
    </div>
  );
};
