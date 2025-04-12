import { AppDataSource } from "../data-source";
import { Reaction } from "../models/Reaction";
import { Message } from "../models/Message";

export class ReactionRepo {
  static reactionRepo = AppDataSource.getRepository(Reaction);

  static async getByMessageId(messageId: number): Promise<Reaction | null> {
    return await this.reactionRepo.findOne({
      where: { message: { id: messageId } },
    });
  }

  static async reactToMessage(
    messageId: number,
    reaction: string
  ): Promise<Reaction> {
    const existing = await this.getByMessageId(messageId);

    if (existing) {
      existing.reaction = reaction;
      return await this.reactionRepo.save(existing);
    }

    const newReaction = this.reactionRepo.create({
      message: { id: messageId } as Message,
      reaction,
    });

    return await this.reactionRepo.save(newReaction);
  }

  static async deleteReaction(messageId: number): Promise<void> {
    await this.reactionRepo.delete({ message: { id: messageId } });
  }
}
