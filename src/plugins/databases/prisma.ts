import { PrismaClient } from "@prisma/client";

export class PrismaService {
  private static instance: PrismaClient;

  private constructor() {}

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient();
      this.instance.$connect();

      // Handle graceful shutdown
      process.on("SIGINT", async () => {
        await this.instance.$disconnect();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        await this.instance.$disconnect();
        process.exit(0);
      });
    }
    return this.instance;
  }
}
