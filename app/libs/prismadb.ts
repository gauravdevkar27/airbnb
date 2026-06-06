import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
    var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
}

const client = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
}

export default client;
