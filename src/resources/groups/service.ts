import { Group, GroupUser, Prisma, PrismaClient, User } from "@prisma/client";
import { PrismaCrudMixin } from "../../plugins/databases/prism-crud";
import { PrismaService } from "../../plugins/databases/prisma";
import { MessageService } from "../messages/service";
import { UserService } from "../users/service";

export class GroupUsersService extends PrismaCrudMixin<GroupUser> {
  constructor(
    private db: PrismaClient = PrismaService.getInstance(),
    private messageService = new MessageService(),
    private userService = new UserService(),
  ) {
    super();
    this.setModel(this.db.groupUser);
  }

  async addGroupUser(userId: string, groupId: string) {
    const userAlreadyExists = await this.get<Partial<GroupUser>>({
      userId,
      groupId,
    });
    if (userAlreadyExists) throw new Error("user already exists");
    const newUser = await this.create<Prisma.GroupUserCreateInput>({
      userId,
      groupId,
    });
    const user = await this.userService.get<Partial<User>>({
      id: userId,
    });

    const groupDefaultMessage = await this.messageService.sendMessage(
      `${user.username} user joined`,
      user.username,
      groupId,
      "sysinfo",
      {
        refId: userId,
        title: `@${user.username} appeared, say Hi everyone`,
        messageMetaType: "user_joined",
      },
    );
    return newUser;
  }

  async findUsersGroup(userId: string) {
    return (this.model as typeof this.db.groupUser).findMany({
      where: {
        userId,
      },
    });
  }
}

export class GroupsService extends PrismaCrudMixin<Group> {
  constructor(
    private db: PrismaClient = PrismaService.getInstance(),
    private messageService = new MessageService(),
    private userService = new UserService(),
    private groupUserService = new GroupUsersService(),
  ) {
    super();
    this.setModel(this.db.group);
  }

  async getUserGroups(username: string) {
    const user = await this.userService.getUser(username);
    const usersGroups = await this.groupUserService.findUsersGroup(user.id);
    const groupIds = usersGroups.map((group) => group.groupId);

    const groups = await this.db.group.findMany({
      where: {
        id: {
          in: groupIds,
        },
      },
    });
    return groups;
  }

  async createGroup(name: string, description: string, username: string) {
    const user = await this.userService.getUser(username);
    const group = await this.create<Prisma.GroupCreateInput>({
      name,
      description,
    });

    // first user is the one creating the group.
    const groupUser = await this.groupUserService.addGroupUser(
      user.id,
      group.id,
    );

    const groupDefaulSysFirstMessage = await this.messageService.sendMessage(
      `new group created by ${user.username}`,
      user.username,
      group.id,
      "sysinfo",
      {
        messageMetaType: "group_updated",
        refId: group.id,
        title: `group created #${group.name} by @${user.username}`,
      },
    );
    return {
      group,
      createdGroupUser: groupUser,
      groupMessage: groupDefaulSysFirstMessage,
    };
  }
}
