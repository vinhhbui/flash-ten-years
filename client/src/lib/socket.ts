import { io } from "socket.io-client";
import { serverUrl } from "./api";

export const wallSocket = io(serverUrl, {
  autoConnect: false,
  reconnection: true,
  transports: ["websocket", "polling"],
});
