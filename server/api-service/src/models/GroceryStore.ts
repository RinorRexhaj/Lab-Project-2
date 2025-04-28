import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { GroceryCategory } from "./GroceryCategory";

@Entity()
export class GroceryStore {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  imageUrl!: string;

  @Column({ type: "text" })
  description!: string;

  @Column("decimal", { precision: 5, scale: 2 })
  deliveryFee!: number;

  @Column()
  estimatedDeliveryTime!: string;

  @Column("decimal", { precision: 3, scale: 1 })
  rating!: number;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  openingTime?: string;

  @Column({ nullable: true })
  closingTime?: string;

  @Column({ default: false })
  isOpen24Hours!: boolean;

  @OneToMany(() => GroceryCategory, (category) => category.store, { cascade: true })
  categories!: GroceryCategory[];
}
