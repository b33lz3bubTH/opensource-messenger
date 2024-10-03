import { Message, MessageType } from "@prisma/client";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  registerEnumType,
  Int,
} from "type-graphql";

import { MessageService } from "./service";

registerEnumType(MessageType, {
  name: "MessageType",
  description: "it is direct or group, or thread",
});

@ObjectType()
class GqlMessageType {
  @Field()
  id: string;

  @Field(() => MessageType)
  type: MessageType;

  @Field()
  senderId: string;

  @Field()
  recipient: string;

  @Field()
  body: string;
}

@ObjectType()
class PaginatedMessageResponse {
  @Field(() => [GqlMessageType])
  data: GqlMessageType[];

  @Field(() => Int)
  total: number;
}

@Resolver(GqlMessageType)
export class MessageResolver {
  private messageService = new MessageService();

  @Mutation(() => GqlMessageType)
  async sendMessage(
    @Arg("sender") username: string,
    @Arg("recipent") recipient: string,
    @Arg("type", () => MessageType) type: MessageType,
    @Arg("messageBody") message: string,
  ): Promise<Message> {
    return this.messageService.sendMessage(message, username, recipient, type);
  }

  @Query(() => PaginatedMessageResponse)
  async getMessagesBetween(
    @Arg("senderId") senderId: string,
    @Arg("recipient") recipient: string,
    @Arg("take", () => Int, { defaultValue: 10 }) take: number,
    @Arg("skip", () => Int, { defaultValue: 0 }) skip: number,
  ): Promise<PaginatedMessageResponse> {
    return this.messageService.getMessagesBetween(
      senderId,
      recipient,
      take,
      skip,
    );
  }
}
