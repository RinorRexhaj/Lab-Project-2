import { AppDataSource } from "../data-source";
import { RefreshToken } from "../models/RefreshToken";
import { User } from "../models/User";

export class TokenRepo {
  static async storeRefreshToken(userId: number, token: string) {
    const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    try {
      refreshTokenRepo.delete({ user: { id: userId } });
      const refreshToken = refreshTokenRepo.create({ user, token });
      await refreshTokenRepo.save(refreshToken);
    } catch (error: any) {
      console.log(error);
    }
  }

  static async findRefreshToken(userId: number) {
    if (!userId) return null;

    const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
    const refreshToken = await refreshTokenRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });

    return refreshToken ? refreshToken.token : null;
  }

  static async deleteRefreshToken(userId: number) {
    if (!userId) return;

    const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
    await refreshTokenRepo.delete({ user: { id: userId } });
  }
}
