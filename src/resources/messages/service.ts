import { Message, PrismaClient, MessageType, User } from "@prisma/client";
import { PrismaService } from "../../plugins/databases/prisma";
import { UserService } from "../users/service";
import { PrismaCrudMixin } from "../../plugins/databases/prism-crud";

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
    return this.paginate<Partial<Message>>(
      { senderId, recipient },
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

  async sendMessage(
    message: string,
    senderUsername: string,
    recipient: string,
    recipientType: MessageType,
  ) {
    const sender = await this.userService.get<Partial<User>>({
      username: senderUsername,
    });

    return this.db.message.create({
      data: {
        type: recipientType,
        recipient,
        senderId: sender.id,
        body: message,
      },
    });
  }
}
