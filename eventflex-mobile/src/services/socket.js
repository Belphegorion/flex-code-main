import { io } from "socket.io-client";
import { BASE_URL } from "./api";

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnecting = false;
  }

  connect(userId) {
    // Prevent multiple connection attempts
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    // Configure Socket.IO with reconnection options
    this.socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      if (userId) {
        this.socket.emit("join-user-room", userId);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      this.isConnecting = false;

      // Implement exponential backoff for reconnection attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(
          () => {
            if (userId) {
              this.connect(userId);
            }
          },
          Math.min(1000 * 2 ** this.reconnectAttempts, 10000),
        );
      }
    });

    this.socket.on("connect_timeout", () => {
      console.error("Socket connection timeout");
      this.isConnecting = false;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      // Rejoin user room after reconnect
      if (userId) {
        this.socket.emit("join-user-room", userId);
      }
    });

    this.socket.on("reconnect_attempt", () => {
      console.log("Socket reconnect attempt");
    });

    this.socket.on("reconnecting", (attemptNumber) => {
      console.log(`Socket reconnecting attempt ${attemptNumber}`);
    });

    this.socket.on("reconnect_error", (err) => {
      console.error("Socket reconnect error:", err.message);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Socket reconnect failed");
      this.isConnecting = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.isConnecting = false;

      // If it was a manual disconnect, don't try to reconnect
      if (
        reason !== "io server disconnect" &&
        reason !== "io client disconnect"
      ) {
        // Try to reconnect if we haven't exceeded max attempts
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(
            () => {
              if (userId) {
                this.connect(userId);
              }
            },
            Math.min(1000 * 2 ** this.reconnectAttempts, 10000),
          );
        }
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  joinGroup(groupId) {
    this.socket?.emit("join-group", groupId);
  }

  onNotification(cb) {
    this.socket?.on("notification", cb);
  }

  offNotification() {
    this.socket?.off("notification");
  }

  onGroupMessage(cb) {
    this.socket?.on("group-message", cb);
  }

  offGroupMessage() {
    this.socket?.off("group-message");
  }

  // Get connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get connection state
  getConnectionState() {
    if (!this.socket) return "disconnected";
    if (this.socket.connected) return "connected";
    if (this.isConnecting) return "connecting";
    return "disconnected";
  }
}

export default new SocketService();
