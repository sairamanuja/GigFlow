import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const SocketContext = createContext(null);

const resolveSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiBase.replace(/\/$/, "").replace(/\/api$/, "");
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const socketRef = useRef(null);
  const [socketState, setSocketState] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketState(null);
      }
      return undefined;
    }

    const socket = io(resolveSocketUrl(), {
      query: { userId: user.id }
    });
    socketRef.current = socket;
    setSocketState(socket);

    socket.on("hire", ({ gigTitle }) => {
      addToast({
        title: "You’ve been hired!",
        description: `You have been hired for ${gigTitle || "a project"}. Congrats!`,
        variant: "success"
      });
    });

    socket.on("connect_error", (err) => {
      addToast({
        title: "Realtime disconnected",
        description: err.message || "Socket connection failed",
        variant: "warning"
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketState(null);
    };
  }, [user, addToast]);

  return <SocketContext.Provider value={{ socket: socketState }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
