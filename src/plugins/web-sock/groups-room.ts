import WebSocket from "ws";

export class GroupRoom {
  private users: Map<string, WebSocket[]> = new Map();

  join(userId: string, ws: WebSocket) {
    if (!this.users.has(userId)) {
      this.users.set(userId, []);
    }
    this.users.get(userId)!.push(ws);
  }

  leave(ws: WebSocket) {
    // Logic to remove the user from the group
    this.users.forEach((sockets, userId) => {
      this.users.set(
        userId,
        sockets.filter((socket) => socket !== ws),
      );
    });
  }

  broadcast(message: { userId: string; data: any }, omitUserId?: string) {
    this.users.forEach((sockets) => {
      sockets.forEach((socket) => {
        if (
          socket.readyState === WebSocket.OPEN &&
          socket["userId"] !== omitUserId
        ) {
          socket.send(JSON.stringify(message));
        }
      });
    });
  }
}
