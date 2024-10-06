import WebSocket, { Server } from "ws";
import { UserRoom } from "./users-room";
import { GroupRoom } from "./groups-room";
import { eventEmitter } from "./events-stream";

export class MessagesWebsocketServer {
  private wss: Server;
  private userRoom: UserRoom;
  private groupRooms: Map<string, GroupRoom> = new Map();

  constructor(server: any) {
    this.wss = new WebSocket.Server({ server });
    this.userRoom = new UserRoom();
    this.initialize();
  }

  private initialize() {
    this.wss.on("connection", (ws: WebSocket, req: any) => {
      const urlParts = req.url?.split("/");
      if (!urlParts) return;

      const type: string = urlParts[1]; // e.g., 'users' or 'group'
      const id: string = urlParts[2]; // e.g., userId or groupId__userId1, groupId__userId2....

      if (type === "users") {
        this.userRoom.join(id, ws);
      } else if (type === "group") {
        this.joinGroup(id, ws);
      }

      ws.on("close", () => {
        // Handle user or group disconnection if needed
        this.userRoom.leave(id, ws);
        this.leaveGroup(id, ws);
      });
    });

    // Listen for user notifications
    eventEmitter.on("notifyUser", (userId: string, message: any) => {
      this.userRoom.notifyUser(userId, message);
    });

    // Listen for group notifications
    eventEmitter.on(
      "broadcastGroupMessage",
      (groupId: string, message: any, messageAuthorId: string) => {
        this.sendGroupMessage(groupId, message, messageAuthorId);
      },
    );

    console.log(`WebSocket server started..`);
  }

  private joinGroup(groupId: string, ws: WebSocket) {
    const [groupUID, userUID] = groupId.split("__");
    if (!this.groupRooms.has(groupUID)) {
      this.groupRooms.set(groupUID, new GroupRoom(groupUID));
    }
    this.groupRooms.get(groupUID).join(userUID, ws);
  }

  private leaveGroup(groupId: string, ws: WebSocket) {
    const [groupUID, userUID] = groupId.split("__");
    this.groupRooms.get(groupUID)?.leave(userUID);
  }

  private sendGroupMessage(
    groupId: string,
    message: any,
    messageAuthorId: string,
  ) {
    this.groupRooms.get(groupId)?.broadcast(messageAuthorId, message);
  }
}
