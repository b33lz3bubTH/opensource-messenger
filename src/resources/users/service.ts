import { PrismaClient, User } from "@prisma/client";
import { PrismaService } from "../../plugins/databases/prisma";
import { PrismaCrudMixin } from "../../plugins/databases/prisma-crud";
import { CryptoService } from "../../plugins/utils/crypto-service";

export class UserService extends PrismaCrudMixin<User> {

  constructor(private db: PrismaClient = PrismaService.getInstance(),
              private cryptoService = new CryptoService()
             ) {
    super();
    this.setModel(this.db.user);
  }

  async signup(username: string, password: string, email: string) {
    const hashedPassword = this.cryptoService.encrypt(password);
    return this.db.user.create({
      data: {
        username,
        password: hashedPassword,
        email
      }
    });
  }

  async signin(username: string, password: string){
    const user = await this.get<Partial<User>>({
      username
    });
    if(!user) throw new Error(`error login`);

    const decryptedPassword = this.cryptoService.decrypt(user.password);
    if(decryptedPassword === password) return user;
    throw new Error(`error login`);
  }
  
  async getUser(username: string) {
    return this.db.user.findFirst({
      where: {
        username,
      },
    });
  }
}
