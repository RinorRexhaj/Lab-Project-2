import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { GroceryStore } from "./GroceryStore";
import { GroceryProduct } from "./GroceryProduct";

@Entity()
export class GroceryCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => GroceryStore, (store) => store.categories)
  store!: GroceryStore;

  @OneToMany(() => GroceryProduct, (product) => product.category, { cascade: true })
  products!: GroceryProduct[];
}
