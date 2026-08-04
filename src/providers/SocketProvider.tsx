"use client";

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import io, { Socket } from "socket.io-client";

/**
 * React Context holding the active Socket.io client instance.
 * Value is null when socket is disconnected or user is unauthenticated.
 */
export const SocketContext = createContext<Socket | null>(null);

/**
 * Custom hook to access the active Socket.io connection.
 *
 * @returns The Socket instance or null if unauthenticated / disconnected.
 */
export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};

interface SocketProviderProps {
    children: ReactNode;
}

/**
 * SocketProvider manages the lifecycle of the Socket.io WebSocket connection.
 * Automatically connects when an auth token is present in Redux store
 * and disconnects cleanly upon unmount or logout.
 */
const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {

        // Create Socket.io connection with auth token
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL);

        // Store socket instance once connected
        socketInstance.on("connect", () => {
            console.log("Socket connected!");
            setSocket(socketInstance);
        });

        // Reset socket state upon disconnection
        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setSocket(null);
        });

        // Cleanup and disconnect socket on component unmount or token change
        return () => {
            socketInstance.disconnect();
            setSocket(null);
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};

export default SocketProvider;