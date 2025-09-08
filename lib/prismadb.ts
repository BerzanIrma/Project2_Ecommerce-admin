import { PrismaClient } from "@/lib/generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismadb = global.prisma || new PrismaClient({
  log: ["query", "error", "warn"],
});

if (process.env.NODE_ENV !== "production") global.prisma = prismadb;

export default prismadb;


