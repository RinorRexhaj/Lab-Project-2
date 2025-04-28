import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { GroceryStore } from "./GroceryStore";
import { GroceryOrderItem } from "./GroceryOrderItem";

@Entity()
export class GroceryOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => GroceryStore)
  store!: GroceryStore;

  @OneToMany(() => GroceryOrderItem, (item) => item.order, { cascade: true })
  items!: GroceryOrderItem[];

  @Column("decimal", { precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column({ default: "Pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
