import { useEffect, useRef } from "react";

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (err: any) => void;
  events?: {
    [eventName: string]: (data: any) => void;
  };
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let socket: any = null;

    const connectSocket = () => {
      const io = (window as any).io;
      if (!io) return;

      socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Socket connected successfully");
        if (optionsRef.current.onConnect) {
          optionsRef.current.onConnect();
        }
      });

      socket.on("connect_error", (err: any) => {
        console.error("Socket connection error:", err);
        if (optionsRef.current.onError) {
          optionsRef.current.onError(err);
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        if (optionsRef.current.onDisconnect) {
          optionsRef.current.onDisconnect();
        }
      });

      // Register dynamic events
      if (optionsRef.current.events) {
        Object.keys(optionsRef.current.events).forEach((event) => {
          socket.on(event, (data: any) => {
            const currentCallback = optionsRef.current.events?.[event];
            if (currentCallback) {
              currentCallback(data);
            }
          });
        });
      }
    };

    const scriptId = "socket-io-cdn-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
      script.async = true;
      script.onload = () => {
        connectSocket();
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).io) {
        connectSocket();
      } else {
        script.addEventListener("load", connectSocket);
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (script) {
        script.removeEventListener("load", connectSocket);
      }
    };
  }, []);
};
