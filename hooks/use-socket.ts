// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type ServerToClientEvents = {
  "new-donation": (data: { username: string; amount: number }) => void;
};

type ClientToServerEvents = {
  "new-donation": (data: { username: string; amount: number }) => void;
};

export const useSocket = () => {
  const socketRef =
    useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(null);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket server", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
};
