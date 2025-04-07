export interface Message {
  id: number;
  sender: number;
  receiver: number;
  text: string;
  sent: Date;
  delivered: Date;
  seen: Date;
}
