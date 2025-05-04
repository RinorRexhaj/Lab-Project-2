import { RequestHandler } from "express";
import { FileModel } from "../models/File";
import { AppDataSource } from "../data-source";
import { MessageFile } from "../models/MessageFile";
import { Message } from "../models/Message";

export const uploadFile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const file = req.file;
    const { messageId } = req.params;

    if (!file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    // Check if message exists
    const message = await AppDataSource.getRepository(Message).findOne({
      where: { id: Number(messageId) },
    });

    if (!message) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    // Create the MessageFile and link it to the message
    const messageFile = new MessageFile();
    messageFile.message = message;
    messageFile.type = file.mimetype.slice(0, file.mimetype.indexOf("/"));
    if (file.originalname === "voice-message.webm") messageFile.type = "voice";

    // Save MessageFile first to ensure the relationship is stored
    await AppDataSource.getRepository(MessageFile).save(messageFile);

    // Now create and save the file
    const newFile = new FileModel({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
      messageId,
    });

    // Save the file to the database
    await newFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      messageId: messageFile.message.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFileDetails: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { messageId } = req.params;

    // Find the file associated with the messageId
    const file = await FileModel.findOne({
      messageId,
    });

    if (!file) {
      res.status(404).json({ error: "File not found for this messageId" });
      return;
    }

    const type = file.mimetype;
    let fileData = null;
    if (
      type.startsWith("image") ||
      type.startsWith("video") ||
      type.startsWith("audio")
    ) {
      fileData = Buffer.from(file.data);
    }

    res.status(200).send({
      filename: file.filename,
      size: file.size,
      type,
      file: fileData ?? undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadFile: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { messageId } = req.params;

    const file = await FileModel.findOne({ messageId });

    if (!file) {
      res.status(404).json({ error: "File not found for this messageId" });
      return;
    }

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.send(Buffer.from(file.data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (messageId: number) => {
  const file = await FileModel.findOne({ messageId });

  if (!file) {
    return false;
  }

  await file.deleteOne();
  return true;
};
