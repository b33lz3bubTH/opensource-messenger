import { MessageType, MessageMeta, MessageMetaType } from "@prisma/client";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  registerEnumType,
  Int,
  InputType,
} from "type-graphql";

import { UserType as GqlUserType } from "../users/resolvers";

import { MessageService } from "./service";

registerEnumType(MessageType, {
  name: "MessageType",
  description: "it is direct or group, or thread",
});

registerEnumType(MessageMetaType, {
  name: "MessageMetaType",
  description:
    "meta is defines the type of polymorphic message, when meta is added, what kind of message is it notificational message or reference.",
});

@InputType()
class InputGqlMessageMeta {
  @Field()
  refId: string;

  @Field()
  title: string;

  @Field(() => MessageMetaType)
  messageMetaType: MessageMetaType;
}

@ObjectType()
class GqlMessageMeta {
  @Field()
  refId: string;

  @Field()
  title: string;

  @Field(() => MessageMetaType)
  messageMetaType: MessageMetaType;
}

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

  @Field(() => GqlMessageMeta, { nullable: true })
  meta: GqlMessageMeta;

  @Field(() => Date)
  createdAt: Date;
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

  @Query(() => [GqlUserType])
  async getConnectedUsers(
    @Arg("userId") userId: string,
    @Arg("take", () => Int, { defaultValue: 10 }) take: number,
    @Arg("skip", () => Int, { defaultValue: 0 }) skip: number,
  ): Promise<GqlUserType[]> {
    return this.messageService.usersMessageNetwork(userId, take, skip);
  }

  @Mutation(() => GqlMessageType)
  async sendMessage(
    @Arg("sender") username: string,
    @Arg("recipent") recipient: string,
    @Arg("type", () => MessageType) type: MessageType,
    @Arg("messageBody") message: string,
    @Arg("meta", () => InputGqlMessageMeta, { nullable: true })
    meta?: MessageMeta,
  ): Promise<GqlMessageType> {
    return this.messageService.sendMessage(
      message,
      username,
      recipient,
      type,
      meta,
    );
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
  // getMessagesFor Query
  @Query(() => PaginatedMessageResponse)
  async getMessagesFor(
    @Arg("recipient") recipient: string,
    @Arg("take", () => Int, { defaultValue: 10 }) take: number,
    @Arg("skip", () => Int, { defaultValue: 0 }) skip: number,
  ): Promise<PaginatedMessageResponse> {
    return this.messageService.getMessagesFor(recipient, take, skip);
  }
}
