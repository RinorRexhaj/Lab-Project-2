import sql from "mssql";
import { connectDB } from "../config/db";

export interface User {
  id?: number;
  username: string;
  password: string;
}

export class UserRepo {
  static async createUser(user: User): Promise<void> {
    const pool = await connectDB();
    await pool
      .request()
      .input("username", sql.VarChar, user.username)
      .input("password", sql.VarChar, user.password)
      .query(
        "INSERT INTO Users (username, password) VALUES (@username, @password)"
      );
  }

  static async findByUsername(username: string): Promise<User | null> {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }
}
