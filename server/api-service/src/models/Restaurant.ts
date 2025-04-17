import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { FoodItem } from "./FoodItem";
import { FoodCategory } from "./FoodCategory";
import { Order } from "./Order";

@Entity({ name: "Restaurants" })
export class Restaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 500 })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column({ length: 50 })
  estimatedDeliveryTime!: string;

  @Column({ type: "decimal", precision: 3, scale: 1, default: 0 })
  rating!: number;

  @Column({ length: 255, nullable: true })
  imageUrl?: string;

  @Column({ length: 50, nullable: true, default: 'All' })
  category?: string;
  
  @Column({ length: 10, nullable: true })
  openingTime?: string;
  
  @Column({ length: 10, nullable: true })
  closingTime?: string;
  
  @Column({ default: false })
  isOpen24Hours?: boolean;

  @OneToMany(() => FoodCategory, (category) => category.restaurant)
  categories!: FoodCategory[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders!: Order[];
}
