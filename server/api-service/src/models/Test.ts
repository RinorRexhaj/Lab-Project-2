import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity({ name: "Test" })
export class Test {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  text!: string;
}
