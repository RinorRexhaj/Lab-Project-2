import sql from "mssql";
import { getDBPool } from "../config/db";
import { User } from "../types/User";

export class UserRepo {
  static async createUser(user: User): Promise<void> {
    const pool = getDBPool();
    await pool
      .request()
      .input("FullName", sql.VarChar, user.FullName)
      .input("Email", sql.VarChar, user.Email)
      .input("Password", sql.VarChar, user.Password)
      .input("Address", sql.VarChar, user.Address)
      .query(
        "INSERT INTO Users (FullName, Email, Password, Address) VALUES (@FullName, @Email, @Password, @Address)"
      );
  }

  static async getUsers(): Promise<User[]> {
    const users = await getDBPool().request().query("SELECT * FROM Users");
    return users.recordset;
  }

  static async findById(id: number): Promise<User | null> {
    const pool = getDBPool();
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .query("SELECT * FROM Users WHERE ID = @ID");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const pool = getDBPool();
    const result = await pool
      .request()
      .input("Email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  static async updateUser(
    id: number,
    fullname: string,
    role: string,
    address: string
  ): Promise<User | null> {
    const pool = getDBPool();
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .input("FullName", sql.VarChar, fullname)
      .input("Role", sql.VarChar, role)
      .input("Address", sql.VarChar, address)
      .query(
        `UPDATE Users 
         SET FullName = @FullName, Role = @Role, Address = @Address 
         WHERE ID = @ID;
         SELECT * FROM Users WHERE ID = @ID;`
      );

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  static async deleteUser(id: number): Promise<boolean> {
    const pool = getDBPool();
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .query("DELETE FROM Users WHERE ID = @ID");

    return result.rowsAffected[0] > 0;
  }
}
