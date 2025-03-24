import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RefreshToken } from "./RefreshToken";
import { Message } from "./Message";

@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  fullName!: string;

  @Column({ length: 50, unique: true })
  email!: string;

  @Column({ length: 60 })
  password!: string;

  @Column({ length: 10, default: "User" })
  role!: string;

  @Column({ length: 100, nullable: true })
  address?: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken!: RefreshToken;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessage!: Message;

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessage!: Message;
}
