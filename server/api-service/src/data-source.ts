import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_SERVER,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  requestTimeout: 60000,
  entities: [__dirname + "/models/*.ts"],
});

export async function connectDB() {
  try {
    await AppDataSource.initialize().then(() =>
      console.log("✅ Connected to MSSQL with TypeORM")
    );
  } catch (error) {
    console.error("❌ TypeORM MSSQL Connection Error:", error);
    throw error;
  }
}
