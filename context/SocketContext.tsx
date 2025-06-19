import React, { createContext, useEffect, useState, useCallback, useRef } from "react";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/lib/socket-client";
import { Socket, io } from "socket.io-client";

type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  connectWithAuth: (fid: number) => void;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectWithAuth: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectedFidRef = useRef<number | null>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  // Keep socketRef in sync with socket state
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  const connectWithAuth = useCallback((fid: number) => {
    // If already connected with the same FID, don't reconnect
    if (connectedFidRef.current === fid && socketRef.current?.connected) {
      console.log("Already connected with FID:", fid);
      return;
    }

    console.log("Connecting socket with FID:", fid);
    
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket with authentication
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        transports: ["websocket"],
        auth: {
          fid: fid,
        },
      }
    );

    // Update the ref to track the connected FID
    connectedFidRef.current = fid;
    setSocket(socketInstance);

    const onConnect = () => {
      console.log("Socket connected with FID:", fid);
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      connectedFidRef.current = null;
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
  }, []); // Empty dependency array since we're using refs

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectWithAuth }}>
      {children}
    </SocketContext.Provider>
  );
};
