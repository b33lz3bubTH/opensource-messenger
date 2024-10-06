// src/server.ts
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

      const type = urlParts[1]; // e.g., 'users' or 'group'
      const id = urlParts[2]; // e.g., userId or groupId

      if (type === "users") {
        this.userRoom.join(id, ws);
        console.log(`User ${id} joined.`);
      } else if (type === "group") {
        this.joinGroup(id, ws);
        console.log(`User joined group ${id}.`);
      }

      // Listen for messages from this connection
      ws.on("message", (message: string) => {
        const { action, userId, groupId, data } = JSON.parse(message);

        switch (action) {
          case "sendGroupMessage":
            this.sendGroupMessage(groupId, userId, data);
            break;

          default:
            console.log("Unknown action:", action);
        }
      });

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
      (groupId: string, userId: string, data: any) => {
        this.sendGroupMessage(groupId, userId, data);
      },
    );

    console.log(
      `WebSocket server started..`,
    );
  }

  private joinGroup(groupId: string, ws: WebSocket) {
    if (!this.groupRooms.has(groupId)) {
      this.groupRooms.set(groupId, new GroupRoom());
      console.log(`Group ${groupId} created.`);
    }

    // Assuming the user's ID is part of the message or can be determined
    const userId = ws["userId"]; // Retrieve the userId from the WebSocket context if needed
    this.groupRooms.get(groupId)!.join(userId, ws);
  }

  private leaveGroup(groupId: string, ws: WebSocket) {
    const groupRoom = this.groupRooms.get(groupId);
    if (groupRoom) {
      groupRoom.leave(ws); // Implement leave logic in GroupRoom
    }
  }

  private sendGroupMessage(groupId: string, userId: string, data: any) {
    const groupRoom = this.groupRooms.get(groupId);
    if (groupRoom) {
      groupRoom.broadcast({ userId, data }, userId);
    } else {
      console.log(`Group ${groupId} not found.`);
    }
  }
}
