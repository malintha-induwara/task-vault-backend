import app from "./app";
import dotenv from 'dotenv';
import prisma from "./config/prisma"; 

dotenv.config();

const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(process.env.PORT, () => {
      console.log(`Server running in ${process.env.ENVIROMENT} mode on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database or start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
