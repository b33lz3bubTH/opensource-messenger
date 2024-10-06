import { User } from "@prisma/client";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
} from "type-graphql";
import { UserService } from "./service";

@ObjectType()
class UserType {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@Resolver(UserType)
export class UserResolver {
  private userService: UserService = new UserService();

  @Query(() => UserType)
  async users(@Arg("username") username: string): Promise<UserType> {
    return this.userService.getUser(username);
  }

  @Query(() => UserType)
  async signIn(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<UserType>{
    return this.userService.signin(username, password);
  }

  @Mutation(() => UserType)
  async signUp(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<UserType> {
    return this.userService.signup(username, password, email);
  }
}
