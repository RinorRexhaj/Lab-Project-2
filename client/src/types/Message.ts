export interface Message {
  id: number;
  sender: number;
  receiver: number;
  text: string;
  sent: Date;
  delivered: Date;
  seen: Date;
  reaction?: string;
  replyTo?: Message;
  created?: boolean;
  deleted?: boolean;
}
