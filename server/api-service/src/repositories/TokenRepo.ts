import sql from "mssql";
import { getDBPool } from "../config/db";

export class TokenRepo {
  static async storeRefreshToken(userId: number, token: string) {
    const pool = getDBPool();
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("token", sql.NVarChar, token)
      .query(
        "INSERT INTO RefreshTokens (userId, token) VALUES (@userId, @token)"
      );
  }

  static async findRefreshToken(userId: number) {
    const pool = getDBPool();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM RefreshTokens WHERE userId = @userId");
    return result.recordset[0].token;
  }

  static async deleteRefreshToken(userId: number) {
    const pool = getDBPool();
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM RefreshTokens WHERE userId = @userId");
  }
}
