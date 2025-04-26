import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
  messageId: number;
  filename: string;
  mimetype: string;
  size: number;
  data: Buffer;
  uploadedAt: Date;
}

const FileSchema = new Schema<IFile>({
  messageId: { type: Number, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const FileModel = mongoose.model<IFile>("File", FileSchema);
