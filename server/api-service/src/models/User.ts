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
  
  @Column({ length: 50, default: "user-avatar-1.png" })
  avatar!: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
    onDelete: "CASCADE"
  })
  refreshToken!: RefreshToken;

  @OneToMany(() => Message, (message) => message.sender, {
    cascade: true,
    onDelete: "CASCADE"
  })
  sentMessage!: Message;

  @OneToMany(() => Message, (message) => message.receiver, {
    cascade: true,
    onDelete: "CASCADE"
  })
  receivedMessage!: Message;
}
