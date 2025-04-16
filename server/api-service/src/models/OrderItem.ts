import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./Order";
import { FoodItem } from "./FoodItem";

@Entity({ name: "OrderItems" })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @Column()
  foodItemId!: number;

  @Column()
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ length: 255, nullable: true })
  specialInstructions?: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => FoodItem, (foodItem) => foodItem.orderItems)
  @JoinColumn({ name: "foodItemId" })
  foodItem!: FoodItem;
}
