export interface Message {
  id: number;
  sender: number;
  receiver: number;
  text: string;
  sent: Date;
  delivered: Date;
  seen: Date;
  reaction?: string;
  replyTo?: {
    id: number;
    text: string;
    sender: number;
    file?: string | false;
  };
  file?: string | false;
}
