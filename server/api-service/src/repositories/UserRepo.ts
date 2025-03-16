import { AppDataSource } from "../data-source";
import { User } from "../models/User";

export class UserRepo {
  static async createUser(user: Partial<User>): Promise<void> {
    const userRepo = AppDataSource.getRepository(User);
    const newUser = userRepo.create(user);
    await userRepo.save(newUser);
  }

  static async getUsers(): Promise<User[]> {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.find();
  }

  static async findById(id: number): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOne({ where: { id } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.findOne({ where: { email } });
  }

  static async updateUser(
    id: number,
    fullname: string,
    role: string,
    address: string
  ): Promise<User | null> {
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return null;

    user.fullName = fullname;
    user.role = role;
    user.address = address;

    await userRepo.save(user);
    return user;
  }

  static async deleteUser(id: number): Promise<boolean> {
    const userRepo = AppDataSource.getRepository(User);
    const deleteResult = await userRepo.delete(id);
    return deleteResult.affected ? deleteResult.affected > 0 : false;
  }
}
