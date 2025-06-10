// hooks/useSocket.ts
import { useAuth } from "@/context/auth-context";
import { SOCKET_URL } from "@/services/apiClient";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      query: {
        userId: user?.id ?? parseInt(process.env.NEXT_PUBLIC_KIOSK_ID ?? "1"),
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef;
};
