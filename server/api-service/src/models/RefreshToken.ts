import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "RefreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: "MAX", nullable: true })
  token!: string;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.refreshToken, {
    onDelete: "CASCADE",
    nullable: false,
  })
  user!: User;
}
