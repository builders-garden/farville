import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./use-socket";
import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import { ClanChatMessageWithUser } from "@/lib/prisma/types";
import { useGame } from "@/context/GameContext";

export const useClanChat = (clanId?: string) => {
  const { socket } = useSocket();
  const { state } = useGame();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ClanChatMessageWithUser[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Send message mutation
  const sendMessageMutation = useApiMutation<
    ClanChatMessageWithUser,
    { message: string }
  >({
    url: `/api/clan/${clanId}/chat`,
    method: "POST",
    isProtected: true,
    body: (variables) => ({ message: variables.message }),
  });

  // Delete message mutation
  const deleteMessageMutation = useApiMutation<
    { success: boolean },
    { messageId: string }
  >({
    url: `/api/clan/${clanId}/chat`,
    method: "DELETE",
    isProtected: true,
    body: (variables) => ({ messageId: variables.messageId }),
  });

  // Fetch initial messages (HTTP request for history)
  const {
    data: initialMessages,
    isLoading,
    refetch,
  } = useApiQuery<ClanChatMessageWithUser[]>({
    queryKey: ["clan-chat", clanId],
    url: `/api/clan/${clanId}/chat`,
    isProtected: true,
    enabled: !!clanId,
  });

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!clanId || isLoadingMore || messages.length === 0 || !hasMoreMessages)
      return;

    setIsLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      const response = await fetch(
        `/api/clan/${clanId}/chat?limit=20&cursor=${oldestMessage.createdAt}`,
        {
          method: "GET",
          credentials: "include", // For authentication consistency
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const olderMessages: ClanChatMessageWithUser[] = await response.json();
        if (olderMessages.length === 0) {
          // No more messages available
          setHasMoreMessages(false);
        } else {
          setMessages((prev) => [...olderMessages, ...prev]);
          // If we got fewer messages than requested, we've reached the end
          if (olderMessages.length < 20) {
            setHasMoreMessages(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [clanId, messages, isLoadingMore, hasMoreMessages]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !clanId) return;

    const handleNewMessage = (data: {
      id: string;
      clanId: string;
      message: string;
      createdAt: Date;
      user: {
        fid: number;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        selectedAvatarUrl: string | null;
        mintedOG: boolean;
      };
    }) => {
      console.log("📨 Received clan-chat-message:", data);
      if (data.clanId === clanId) {
        // Convert socket data to ClanChatMessageWithUser format
        const message: ClanChatMessageWithUser = {
          id: data.id,
          clanId: data.clanId,
          fid: data.user.fid,
          message: data.message,
          createdAt: data.createdAt,
          user: data.user,
        };

        // Add message only if it doesn't already exist (prevent duplicates)
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (messageExists) return prev;
          console.log("✅ Adding new message to local state:", message);
          return [...prev, message];
        });
      }
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    };

    const handleError = (data: { message: string }) => {
      console.error("Socket error:", data.message);
    };

    // Join clan chat room
    console.log("🏠 Joining clan chat room:", clanId);
    socket.emit("join-clan-chat", clanId);
    socket.on("clan-chat-message", handleNewMessage);
    socket.on("clan-chat-message-deleted", handleMessageDeleted);
    socket.on("error", handleError);

    return () => {
      socket.emit("leave-clan-chat", clanId);
      socket.off("clan-chat-message", handleNewMessage);
      socket.off("clan-chat-message-deleted", handleMessageDeleted);
      socket.off("error", handleError);
    };
  }, [socket, clanId, state.user?.fid]);

  // Initialize messages when data is loaded
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages.reverse()); // Reverse to show oldest first
      // Reset hasMoreMessages state - if we got fewer than expected, there might not be more
      setHasMoreMessages(initialMessages.length >= 20); // Assuming 20 is the default limit
    }
  }, [initialMessages]);

  // Send message function (using useApiMutation)
  const sendMessage = useCallback(
    (message: string) => {
      if (
        !message.trim() ||
        !clanId ||
        !state.user ||
        sendMessageMutation.isPending
      ) {
        return;
      }

      sendMessageMutation.mutate(
        { message: message.trim() },
        {
          onSuccess: () => {
            // Invalidate and refetch the clan chat query to get the latest messages
            queryClient.invalidateQueries({
              queryKey: ["clan-chat", clanId],
            });
            // The message will also be received via socket event for real-time updates
          },
          onError: (error) => {
            console.error("Failed to send message:", error);
          },
        }
      );
    },
    [clanId, state.user, sendMessageMutation, queryClient]
  );

  // Delete message function (using useApiMutation)
  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!clanId || !state.user) {
        return;
      }

      // Optimistically remove the message from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      deleteMessageMutation.mutate(
        { messageId },
        {
          onSuccess: () => {
            // The API route will trigger socket emission to other clan members
          },
          onError: (error) => {
            console.error("Failed to delete message:", error);
            // Revert optimistic update on error
            // Note: We'd need to re-fetch to get the correct state, but for now we'll let
            // the socket event system handle consistency
          },
        }
      );
    },
    [clanId, state.user, deleteMessageMutation]
  );

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    isSending: sendMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    refetch,
  };
};
