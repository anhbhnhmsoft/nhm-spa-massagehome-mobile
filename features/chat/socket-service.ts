import io, { Socket } from 'socket.io-client';

import { _SocketURL } from '@/lib/const';

class SocketService {
  public socket: Socket | null = null;
  private supportMessageCallbacks = new Set<(message: any) => void>();
  private supportTicketCallbacks = new Set<(payload: any) => void>();
  private readonly supportMessageEmitter = (data: any) => {
    this.supportMessageCallbacks.forEach((callback) => callback(data));
  };
  private readonly supportTicketEmitter = (payload: any) => {
    this.supportTicketCallbacks.forEach((callback) => callback(payload));
  };

  /**
   * Connect to Socket Server
   * @param token
   */
  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(_SocketURL, {
      transports: ['websocket'], // Bắt buộc với React Native để tránh lỗi polling
      auth: {
        token: token,
      },
    });

    if (this.supportMessageCallbacks.size > 0) {
      this.socket.on('support:message:new', this.supportMessageEmitter);
    }

    if (this.supportTicketCallbacks.size > 0) {
      this.socket.on('support:ticket:created', this.supportTicketEmitter);
      this.socket.on('support:ticket:claimed', this.supportTicketEmitter);
      this.socket.on('support:ticket:closed', this.supportTicketEmitter);
    }

    return this.socket;
  }


  /**
   * Chờ đợi kết nối thành công
   * @returns Promise<void>
   */
  waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 1. Nếu đã kết nối rồi -> Xong luôn
      if (this.socket?.connected) {
        return resolve();
      }
      // 2. Nếu chưa, đợi sự kiện 'connect'
      // Timeout 5s để tránh treo app mãi mãi
      const timeout = setTimeout(() => {
        reject(new Error("Socket connection timeout (5s)"));
      }, 5000);

      this.socket?.once('connect', () => {
        clearTimeout(timeout); // Xóa timeout
        resolve(); // Báo thành công
      });

      // Nếu lỗi connect
      this.socket?.once('connect_error', (err) => {
        clearTimeout(timeout);
        reject(new Error("Socket connect error: " + err.message));
      });
    });
  }

  /**
   * Join Room với cơ chế Callback (Promise)
   * Chờ Server trả lời { status: 'ok' } mới resolve
   */
  joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        return reject(new Error("Socket chưa kết nối"));
      }

      const timer = setTimeout(() => {
        reject(new Error("Timeout: Server không phản hồi join"));
      }, 5000);

      this.socket.emit('join', { roomId }, (response: any) => {
        clearTimeout(timer);
        if (response?.status === 'ok') {
          resolve();
        } else {
          reject(new Error(response?.message || "Không thể vào phòng"));
        }
      });
    });
  }

  /**
   * rời khỏi một room với roomId
   * @param roomId
   */
  leaveRoom(roomId: string) {
    if (!this.socket || !this.socket.connected) return;
    this.socket.emit('leave', { roomId });
  }

  /**
   * Lắng nghe sự kiện message mới
   * @param callback
   */
  onMessageNew(callback: (message: any) => void) {
    if (this.socket) {
      // Xóa listener cũ để tránh duplicate nếu component re-render
      this.socket.off('message:new');
      this.socket.on('message:new', (data) => {
        callback(data);
      });
    }
  }

  onSupportMessageNew(callback: (message: any) => void) {
    if (this.socket) {
      if (this.supportMessageCallbacks.size === 0) {
        this.socket.on('support:message:new', this.supportMessageEmitter);
      }
      this.supportMessageCallbacks.add(callback);
    }
  }

  onSupportTicketEvent(callback: (payload: any) => void) {
    if (this.socket) {
      if (this.supportTicketCallbacks.size === 0) {
        this.socket.on('support:ticket:created', this.supportTicketEmitter);
        this.socket.on('support:ticket:claimed', this.supportTicketEmitter);
        this.socket.on('support:ticket:closed', this.supportTicketEmitter);
      }
      this.supportTicketCallbacks.add(callback);
    }
  }

  /**
   * Hủy lắng nghe sự kiện message mới
   */
  offMessageNew() {
    if (this.socket) {
      this.socket.off('message:new');
    }
  }

  offSupportMessageNew(callback?: (message: any) => void) {
    if (callback) {
      this.supportMessageCallbacks.delete(callback);
    } else {
      this.supportMessageCallbacks.clear();
    }

    if (this.socket) {
      this.socket.off('support:message:new', this.supportMessageEmitter);
      if (this.supportMessageCallbacks.size > 0) {
        this.socket.on('support:message:new', this.supportMessageEmitter);
      }
    }
  }

  offSupportTicketEvent(callback?: (payload: any) => void) {
    if (callback) {
      this.supportTicketCallbacks.delete(callback);
    } else {
      this.supportTicketCallbacks.clear();
    }

    if (this.socket) {
      this.socket.off('support:ticket:created', this.supportTicketEmitter);
      this.socket.off('support:ticket:claimed', this.supportTicketEmitter);
      this.socket.off('support:ticket:closed', this.supportTicketEmitter);
      if (this.supportTicketCallbacks.size > 0) {
        this.socket.on('support:ticket:created', this.supportTicketEmitter);
        this.socket.on('support:ticket:claimed', this.supportTicketEmitter);
        this.socket.on('support:ticket:closed', this.supportTicketEmitter);
      }
    }
  }

  /**
   * Ngắt kết nối với server
   */
  disconnect() {
    if (this.socket) {
      this.offSupportMessageNew();
      this.offSupportTicketEvent();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
