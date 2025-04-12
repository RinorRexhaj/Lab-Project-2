import { Request, Response } from "express";
import { ReactionRepo } from "../repositories/ReactionRepo";

export const reactToMessage = async (req: Request, res: Response) => {
  const messageId = Number(req.params.messageId);
  const { reaction } = req.body;

  if (!messageId) {
    res.status(400).json({ error: "Message ID is required" });
    return;
  }

  try {
    if (!reaction || reaction.trim() === "") {
      await ReactionRepo.deleteReaction(messageId);
      res.status(200).json({
        message: "Reaction deleted",
        messageId,
      });
      return;
    }

    const updatedReaction = await ReactionRepo.reactToMessage(
      messageId,
      reaction
    );
    res.status(200).json({
      message: "Reaction saved",
      messageId,
      reaction: updatedReaction.reaction,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not process reaction" });
    return;
  }
};
