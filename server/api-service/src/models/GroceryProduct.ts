import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { GroceryCategory } from "./GroceryCategory";

@Entity()
export class GroceryProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  weight?: string;

  @Column({ default: true })
  inStock!: boolean;

  @ManyToOne(() => GroceryCategory, (category) => category.products)
  category!: GroceryCategory;
}
