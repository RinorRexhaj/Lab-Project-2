import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity({ name: "Messages" })
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  text!: string;

  @Column()
  sent!: Date;

  @Column()
  delivered!: Date;

  @Column()
  seen!: Date;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  sender!: User;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  receiver!: User;
}
