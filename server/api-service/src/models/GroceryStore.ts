import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { GroceryCategory } from "./GroceryCategory";

@Entity({ name: "GroceryStores" })
export class GroceryStore {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 255 })
  imageUrl!: string;

  @Column({ length: 500 })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column({ length: 50 })
  estimatedDeliveryTime!: string;

  @Column({ type: "decimal", precision: 3, scale: 1, default: 0 })
  rating!: number;

  @Column({ length: 50, nullable: true, default: 'All' })
  category?: string;

  @Column({ length: 10, nullable: true })
  openingTime?: string;

  @Column({ length: 10, nullable: true })
  closingTime?: string;

  @Column({ default: false })
  isOpen24Hours!: boolean;

  @OneToMany(() => GroceryCategory, (category) => category.store)
  categories!: GroceryCategory[];
}
