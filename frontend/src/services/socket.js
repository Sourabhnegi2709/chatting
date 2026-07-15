import { io } from "socket.io-client";
import server from "../environment";

let socket = null;
let connectionPromise = null;

export const connectSocket = () => {
    if (socket?.connected) return socket;
    
    if (socket) return socket;

    socket = io(server, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
};

export const waitForSocketConnection = () => {
    if (!socket) connectSocket();
    
    return new Promise((resolve) => {
        if (socket?.connected) {
            resolve(socket);
            return;
        }
        socket.once('connect', () => resolve(socket));
    });
};

export const getSocket = () => {
    if (!socket) return connectSocket();
    return socket;
};

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
    connectionPromise = null;
};
