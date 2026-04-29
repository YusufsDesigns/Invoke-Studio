import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getConnectionString(): string {
  const raw = process.env.DATABASE_URL!;
  try {
    const url = new URL(raw);
    // pg v8 doesn't support channel_binding — Neon adds it but it breaks the JS driver
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return raw;
  }
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: getConnectionString() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
