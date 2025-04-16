import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Restaurant } from "./Restaurant";
import { FoodItem } from "./FoodItem";

@Entity({ name: "FoodCategories" })
export class FoodCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column()
  restaurantId!: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories)
  @JoinColumn({ name: "restaurantId" })
  restaurant!: Restaurant;

  @OneToMany(() => FoodItem, (item) => item.category)
  items!: FoodItem[];
}
