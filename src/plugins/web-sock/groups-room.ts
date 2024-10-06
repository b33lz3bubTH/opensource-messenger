import WebSocket from "ws";

export class GroupRoom {
  // { users: [ {userId, ws} ] }

  private users: { userId: string; socket: WebSocket }[] = [];

  constructor(private groupId: string) {}

  join(userId: string, ws: WebSocket) {
    this.users.push({ userId, socket: ws });
  }

  leave(ws: WebSocket) {
    this.users = this.users.filter((user) => user.socket !== ws);
  }

  broadcast(userId: string, message: string) {
    this.users.map((user) => {
      if (user.userId === userId) {
        return;
      }
      user.socket.send(JSON.stringify(message));
    });
  }
}
