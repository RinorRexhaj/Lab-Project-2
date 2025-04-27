export interface FileDetails {
  filename: string;
  size: string;
  type: string;
  contentType: string;
  file?: { data: number[] };
}
