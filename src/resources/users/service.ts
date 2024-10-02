import { PrismaClient, User } from "@prisma/client";
import { PrismaService } from "../../plugins/databases/prisma";

export class UserService{
  db: PrismaClient;

  constructor() {
    this.db = PrismaService.getInstance();
  }

  async signup(username: string, password: string, email: string) {
    return this.db.user.create({
      data: {
        username,
        password,
        email
      }
    });
  }
  
  async getUser(username: string) {
    return this.db.user.findFirst({
      where: {
        username,
      },
    });
  }
}
