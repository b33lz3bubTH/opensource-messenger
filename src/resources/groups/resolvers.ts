import {
  Field,
  ObjectType,
  Resolver,
  Mutation,
  Arg,
  Query
} from "type-graphql";

import { GroupsService, GroupUsersService } from "./service";

@ObjectType()
export class GqlGroup {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@Resolver()
export class GroupsResolver {
  private groupService = new GroupsService();
  private groupUserService = new GroupUsersService();

  @Mutation(() => GqlGroup)
  async createGroup(
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("username") username: string,
  ): Promise<GqlGroup> {
    const { group } = await this.groupService.createGroup(
      name,
      description,
      username,
    );
    return group;
  }

  @Mutation(() => Boolean)
  async addMember(
    @Arg("userId") userId: string,
    @Arg("groupId") groupId: string,
  ) {
    const addedUser = await this.groupUserService.addGroupUser(userId, groupId);
    if (addedUser.id) return true;
    throw new Error(`cannot add user to the group`);
  }

  @Query(() => [GqlGroup])
  async getGroups(@Arg("username") username: string) {
    return this.groupService.getUserGroups(username);
  }
}
