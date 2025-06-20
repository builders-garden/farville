import { io, Socket } from "socket.io-client";

// Server-side socket client for Next.js API routes to emit events to the backend service
let serverSocket: Socket | null = null;

export const getServerSocket = () => {
  if (!serverSocket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    serverSocket = io(socketUrl, {
      transports: ["websocket"],
      forceNew: true,
    });

    serverSocket.on("connect", () => {
      console.log("Server-side socket connected to backend service");
    });

    serverSocket.on("disconnect", () => {
      console.log("Server-side socket disconnected from backend service");
    });

    serverSocket.on("error", (error) => {
      console.error("Server-side socket error:", error);
    });
  }
  return serverSocket;
};

export const emitClanChatMessageDeleted = (
  clanId: string,
  messageId: string
) => {
  try {
    const socket = getServerSocket();
    // Emit directly to the backend service's socket rooms
    socket.emit("admin-clan-chat-message-deleted", {
      clanId,
      messageId,
    });
  } catch (error) {
    console.warn("Failed to emit clan chat message deleted event:", error);
  }
};
