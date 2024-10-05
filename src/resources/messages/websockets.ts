abstract class MessageNotificationSystem {
  constructor() {}

  abstract registerUsers(client: never): void;

  abstract notifyUserToUser(message: never, from: string, to: string): void;

  abstract notifyGroupUser(message: never, groupRefId: string): void;

  abstract GroupMemberRegister(groupRefId: string, clientId: string): void;
}
