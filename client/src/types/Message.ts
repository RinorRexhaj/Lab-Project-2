export interface Message {
  id: number;
  sender: number;
  receiver: number;
  text: string;
  sent: Date;
  seen: Date;
  created?: boolean;
  deleted?: boolean;
}
