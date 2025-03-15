import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME as string,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function connectDB(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      pool = await sql.connect(dbConfig);
      console.log("✅ Connected to MSSQL Database");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }
  return pool;
}

export function getDBPool(): sql.ConnectionPool {
  if (!pool) {
    throw new Error(
      "Database connection not initialized. Call connectDB() first."
    );
  }
  return pool;
}
