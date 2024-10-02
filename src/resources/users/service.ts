import { PrismaClient, User } from "@prisma/client";
import { PrismaService } from "../../plugins/databases/prisma";
import { PrismaCrudMixin } from "../../plugins/databases/prism-crud";

export class UserService extends PrismaCrudMixin<User> {

  constructor(private db: PrismaClient = PrismaService.getInstance()) {
    super();
    this.setModel(this.db.user);
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
