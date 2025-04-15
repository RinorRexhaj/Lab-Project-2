import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Restaurant } from "./Restaurant";
import { OrderItem } from "./OrderItem";

@Entity({ name: "Orders" })
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  restaurantId!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;

  @Column({ length: 20, default: "Pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
  @JoinColumn({ name: "restaurantId" })
  restaurant!: Restaurant;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items!: OrderItem[];
}
