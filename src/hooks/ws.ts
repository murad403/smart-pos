// import { useEffect, useRef } from "react";

// interface UseSocketOptions {
//     onConnect?: () => void;
//     onDisconnect?: () => void;
//     onError?: (err: any) => void;
//     events?: {
//         [eventName: string]: (data: any) => void;
//     };
// }

// export const useSocket = (options: UseSocketOptions = {}) => {
//     const optionsRef = useRef(options);
//     optionsRef.current = options;

//     useEffect(() => {
//         let socket: any = null;
//         let cancelled = false;

//         const connectSocket = () => {
//             if (cancelled) return;

//             const io = (window as any).io;
//             if (!io) return;
//             socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
//                 transports: ["websocket"],
//                 forceNew: true,
//             });

//             socket.on("connect", () => {
//                 console.log("Socket connected successfully:", socket.id);
//                 optionsRef.current.onConnect?.();
//             });

//             socket.on("connect_error", (err: any) => {
//                 console.error("Socket connection error:", err);
//                 optionsRef.current.onError?.(err);
//             });

//             socket.on("disconnect", () => {
//                 console.log("Socket disconnected");
//                 optionsRef.current.onDisconnect?.();
//             });

//             // Register dynamic events
//             if (optionsRef.current.events) {
//                 Object.keys(optionsRef.current.events).forEach((event) => {
//                     socket.on(event, (data: any) => {
//                         const currentCallback = optionsRef.current.events?.[event];
//                         if (currentCallback) {
//                             currentCallback(data);
//                         }
//                     });
//                 });
//             }
//         };

//         const scriptId = "socket-io-cdn-script";
//         let script = document.getElementById(scriptId) as HTMLScriptElement;

//         if (!script) {
//             script = document.createElement("script");
//             script.id = scriptId;
//             script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
//             script.async = true;
//             script.onload = () => {
//                 connectSocket();
//             };
//             document.body.appendChild(script);
//         } else {
//             if ((window as any).io) {
//                 connectSocket();
//             } else {
//                 script.addEventListener("load", connectSocket);
//             }
//         }

//         return () => {
//             cancelled = true;

//             if (socket) {
//                 socket.removeAllListeners();
//                 socket.disconnect();
//                 socket = null;
//             }

//             if (script) {
//                 script.removeEventListener("load", connectSocket);
//             }
//         };
//     }, []);
// };


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
        let cancelled = false;

        const connectSocket = () => {
            if (cancelled) return;

            const io = (window as any).io;
            if (!io) return;

            socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
                transports: ["websocket"],
                forceNew: true,
            });

            socket.on("connect", () => {
                console.log("[socket] connected:", socket.id, "url:", process.env.NEXT_PUBLIC_SOCKET_URL);
                optionsRef.current.onConnect?.();
            });

            socket.on("connect_error", (err: any) => {
                console.error("[socket] connect_error:", err?.message || err);
                optionsRef.current.onError?.(err);
            });

            socket.on("disconnect", (reason: any) => {
                console.log("[socket] disconnected:", reason);
                optionsRef.current.onDisconnect?.();
            });

            // TEMP DEBUG: logs every single event this socket receives,
            // regardless of name. Use this to confirm whether the backend
            // is sending anything at all when an order becomes ready, and
            // under what exact event name. Remove once confirmed.
            if (typeof socket.onAny === "function") {
                socket.onAny((eventName: string, ...args: any[]) => {
                    console.log("[socket] event received ->", eventName, args);
                });
            }

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
            cancelled = true;

            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
                socket = null;
            }

            if (script) {
                script.removeEventListener("load", connectSocket);
            }
        };
    }, []);
};