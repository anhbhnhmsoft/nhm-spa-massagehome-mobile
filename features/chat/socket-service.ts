import io, { Socket } from 'socket.io-client';

import { _SocketURL } from '@/lib/const';

class SocketService {
  public socket: Socket | null = null;

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
      this.socket.on('message:new', callback);
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

  /**
   * Ngắt kết nối với server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
