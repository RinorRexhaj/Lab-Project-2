import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Message } from "./Message";

@Entity({ name: "Replies" })
export class Reply {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Message, { nullable: false })
  @JoinColumn({ name: "messageId" })
  message!: Message;

  @ManyToOne(() => Message, { nullable: false })
  @JoinColumn({ name: "replyToId" })
  replyTo!: Message;
}
