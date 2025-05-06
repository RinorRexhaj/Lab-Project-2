export interface ChatFile {
  file: Buffer<ArrayBuffer> | undefined;
  filename: string;
  size: number;
  type: string;
}
