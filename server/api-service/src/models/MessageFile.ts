import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Message } from "./Message";

@Entity({ name: "MessageFiles" })
@Unique(["message"])
export class MessageFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Message, { nullable: false })
  @JoinColumn({ name: "messageId" })
  message!: Message;

  @Column()
  type!: string;
}
