import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { GroceryCategory } from "./GroceryCategory";

@Entity({ name: "GroceryProducts" })
export class GroceryProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column({ length: 255, nullable: true })
  imageUrl?: string;

  @Column({ length: 50, nullable: true })
  unit?: string;

  @Column({ length: 50, nullable: true })
  weight?: string;

  @Column({ default: true })
  inStock!: boolean;

  @Column()
  categoryId!: number;

  @ManyToOne(() => GroceryCategory, (category) => category.products)
  @JoinColumn({ name: "categoryId" })
  category!: GroceryCategory;
}
