import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./use-socket";
import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import { ClanChatMessageWithUser } from "@/lib/prisma/types";
import { useGame } from "@/context/GameContext";

export const useClanChat = (clanId?: string) => {
  const { socket } = useSocket();
  const { state } = useGame();
  const [messages, setMessages] = useState<ClanChatMessageWithUser[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch initial messages
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

  // Send message mutation
  const sendMessageMutation = useApiMutation<
    ClanChatMessageWithUser,
    { message: string }
  >({
    url: `/api/clan/${clanId}/chat`,
    method: "POST",
    body: (variables) => ({ message: variables.message }),
  });

  // Delete message mutation
  const deleteMessageMutation = useApiMutation<
    { success: boolean },
    { messageId: string }
  >({
    url: `/api/clan/${clanId}/chat`,
    method: "DELETE",
    body: (variables) => ({ messageId: variables.messageId }),
  });

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!clanId || isLoadingMore || messages.length === 0) return;

    setIsLoadingMore(true);
    try {
      const oldestMessage = messages[0];
      const response = await fetch(
        `/api/clan/${clanId}/chat?limit=20&cursor=${oldestMessage.createdAt}`
      );
      if (response.ok) {
        const olderMessages: ClanChatMessageWithUser[] = await response.json();
        setMessages((prev) => [...olderMessages, ...prev]);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [clanId, messages, isLoadingMore]);

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
          return [...prev, message];
        });
      }
    };

    // Join clan chat room
    socket.emit("join-clan-chat", clanId);
    socket.on("clan-chat-message", handleNewMessage);

    return () => {
      socket.emit("leave-clan-chat", clanId);
      socket.off("clan-chat-message", handleNewMessage);
    };
  }, [socket, clanId]);

  // Initialize messages when data is loaded
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages.reverse()); // Reverse to show oldest first
    }
  }, [initialMessages]);

  // Send message function
  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;

      sendMessageMutation.mutate(
        { message: message.trim() },
        {
          onSuccess: (newMessage) => {
            // Add the message immediately from the API response
            setMessages((prev) => [...prev, newMessage]);
            // Also refetch to ensure consistency with server state
            refetch();
            console.log("SENDING MESSAGE", newMessage, socket, state.user);
            // Emit the socket message for real-time updates to other users
            if (socket && state.user) {
              socket.emit("send-clan-chat-message", {
                clanId: clanId!,
                message: message.trim(),
                fid: state.user.fid,
              });
            }
          },
          onError: (error) => {
            console.error("Failed to send message:", error);
          },
        }
      );
    },
    [sendMessageMutation, refetch, socket, clanId, state.user]
  );

  // Delete message function
  const deleteMessage = useCallback(
    (messageId: string) => {
      deleteMessageMutation.mutate(
        { messageId },
        {
          onSuccess: () => {
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          },
          onError: (error) => {
            console.error("Failed to delete message:", error);
          },
        }
      );
    },
    [deleteMessageMutation]
  );

  return {
    messages,
    isLoading,
    isLoadingMore,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    isSending: sendMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    refetch,
  };
};
