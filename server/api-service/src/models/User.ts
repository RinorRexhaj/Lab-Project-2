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

  @Column({ length: 10, default: "active" })
  status!: string; // 'active' or 'suspended'
  
  @Column({ length: 255, nullable: true })
  suspendReason?: string;
  
  @Column({ type: "datetime", nullable: true })
  suspendExpiryDate?: Date;

  @Column({ length: 100, nullable: true })
  address?: string;
  
  @Column({ length: 50, default: "user-avatar-1.png" })
  avatar!: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  dateJoined!: Date;

  @Column({ type: "datetime", nullable: true })
  lastLogin?: Date;

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
