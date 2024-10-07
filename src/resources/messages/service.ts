import {
  Message,
  PrismaClient,
  MessageType,
  User,
  Prisma,
  MessageMeta,
} from "@prisma/client";
import { PrismaService } from "../../plugins/databases/prisma";
import { UserService } from "../users/service";
import { PrismaCrudMixin } from "../../plugins/databases/prisma-crud";
import {
  events,
  eventEmitter as messageEmitter,
} from "../../plugins/web-sock/events-stream";

export class MessageService extends PrismaCrudMixin<Message> {
  private userService: UserService = new UserService();

  constructor(private db: PrismaClient = PrismaService.getInstance()) {
    super();
    this.setModel(this.db.message);
  }

  async getMessagesBetween(
    senderId: string,
    recipient: string,
    take: number = 10,
    skip: number = 0,
  ) {
    //user sending message to a user. cant use getMessageFor, recipient=suphal@gmail.com sender=sourav@gmail.com
    // reason, getting only messages for recipient will bring sourav@gmail.com, sayak@gmail.com ...
    // thats why bringing messages only dedicated to sourav@gmail.com and suphal@gmail.com
    return this.paginate<Partial<Prisma.MessageWhereInput>>(
      {
        OR: [
          { senderId, recipient },
          {
            senderId: recipient,
            recipient: senderId,
          },
        ],
      },
      { take, skip },
      [{ field: "createdAt", direction: "desc" }],
    );
  }

  async getMessagesFor(recipient: string, take: number = 10, skip: number = 0) {
    // groups and thread.
    // multiple user, so only recipient matters, as recipient will be group or thread id
    return this.paginate<Partial<Message>>({ recipient }, { take, skip }, [
      { field: "createdAt", direction: "desc" },
    ]);
  }

  async usersMessageNetwork(
    userId: string,
    take: number = 10,
    skip: number = 0,
  ): Promise<User[]> {
    const knownUserMessages = await (
      this.model as typeof this.db.message
    ).findMany({
      where: {
        OR: [
          { senderId: userId, type: "direct" }, // Messages sent by the user
          { recipient: userId, type: "direct" }, // Messages received by the user
        ],
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const connectedUserIds = new Set<string>();
    knownUserMessages.forEach((message) => {
      connectedUserIds.add(message.senderId);
      connectedUserIds.add(message.recipient);
    });

    connectedUserIds.delete(userId);
    const userIds = Array.from(connectedUserIds);

    // todo: fix it later to use the userService class
    return this.db.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }

  async sendMessage(
    message: string,
    senderUsername: string,
    recipient: string,
    recipientType: MessageType,
    meta?: MessageMeta,
  ) {
    const sender = await this.userService.get<Partial<User>>({
      username: senderUsername,
    });

    type check = typeof this.db.message;

    const newMessage = await (this.model as typeof this.db.message).create({
      data: {
        type: recipientType,
        recipient,
        senderId: sender.id,
        body: message,
        meta,
      },
    });

    switch (recipientType) {
      case "direct":
        messageEmitter.emit(events.notifyUser, recipient, newMessage);
        break;
      case "group":
        console.log(`sending group message`);
        messageEmitter.emit(
          events.broadcastGroupMessage,
          recipient,
          newMessage,
          sender.id,
        );
        break;
      default:
        console.log(`cannot notify ${recipientType} messages.`);
    }

    return newMessage;
  }
}
