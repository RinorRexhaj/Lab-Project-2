import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { FoodCategory } from "./FoodCategory";
import { OrderItem } from "./OrderItem";

@Entity({ name: "FoodItems" })
export class FoodItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 500 })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ length: 255, nullable: true })
  imageUrl?: string;

  @Column()
  categoryId!: number;

  @ManyToOne(() => FoodCategory, (category) => category.items)
  @JoinColumn({ name: "categoryId" })
  category!: FoodCategory;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.foodItem)
  orderItems!: OrderItem[];
}
