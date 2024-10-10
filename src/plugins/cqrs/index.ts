import { CQRSManager, Command, XcomObject } from "./manager";

// Create the context with database and cache services
const ctx = {
  db: null,
  cacheService: null,
};

// Type of ctx inferred dynamically
export type Ctx = typeof ctx;

// Create an instance of CQRSManager with the ctx
const cqrsManager = new CQRSManager<Ctx>(ctx);

export { cqrsManager, Command, XcomObject };
