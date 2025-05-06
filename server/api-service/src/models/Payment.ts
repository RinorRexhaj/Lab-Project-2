import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "Payments" })
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPrice!: number;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
