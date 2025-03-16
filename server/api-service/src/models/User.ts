import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from "typeorm";
import { RefreshToken } from "./RefreshToken";

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
}
