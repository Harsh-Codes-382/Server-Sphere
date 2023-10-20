import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// To reduce the HotLoad of Nextjs we are doing this so everytime we make changes Next do not create new PrismaClient everytime so, we append that in
// "globalThis" because this is not affected by Nextjs

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
