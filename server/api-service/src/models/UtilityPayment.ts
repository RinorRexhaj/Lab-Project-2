import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class UtilityPayment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.utilityPayments)
  user!: User;

  @Column()
  fullName!: string;

  @Column()
  consumerCode!: string;

  @Column({ type: 'date' })
  paymentDate!: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  type!: "water" | "electricity";

  @CreateDateColumn()
  createdAt!: Date;
}
