import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { configDotenv } from "dotenv";
configDotenv();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
    try{
        await prisma.$connect();
        console.log("Successfully connected to Database!✅");
    } catch(err){
        console.log("Failed to connect to Database!⚠️");
    }
}

export default connectDB;