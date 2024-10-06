import WebSocket from "ws";

export class UserRoom {
  private users: Map<string, WebSocket> = new Map();

  join(userId: string, ws: WebSocket) {
    this.users.set(userId, ws);
  }

  leave(userId: string, ws: WebSocket) {
    const userSockets = this.users.get(userId);
    if (userSockets) {
      this.users.delete(userId);
    }
  }

  notifyUser(userId: string, message: any) {
    const userSocket = this.users.get(userId);
    if (userSocket) {
      userSocket.send(JSON.stringify(message));
    }
  }
}
