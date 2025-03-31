import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`${signal} signal received. Disconnecting Prisma Client...`);
  await prisma.$disconnect();
  console.log("Prisma Client disconnected.");
  process.exit(0);
}

// Listen to termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default prisma;
