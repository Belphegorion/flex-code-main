import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        this.socket.emit('join-user-room', userId);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  joinGroup(groupId) {
    if (this.socket) {
      this.socket.emit('join-group', groupId);
    }
  }

  onGroupMessage(callback) {
    if (this.socket) {
      this.socket.on('group-message', callback);
    }
  }

  offGroupMessage() {
    if (this.socket) {
      this.socket.off('group-message');
    }
  }
}

export default new SocketService();
