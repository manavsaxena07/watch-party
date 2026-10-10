import { io } from "socket.io-client";

const socket = io("https://watch-party-backend-9k8x.onrender.com", {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;