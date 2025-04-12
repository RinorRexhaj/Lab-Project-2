import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Message } from "./Message";

@Entity({ name: "Reactions" })
@Unique(["message"])
export class Reaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Message, { nullable: false })
  @JoinColumn({ name: "messageId" })
  message!: Message;

  @Column({ type: "varchar", length: 10 })
  reaction!: string;
}
