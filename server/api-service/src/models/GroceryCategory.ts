import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { GroceryStore } from "./GroceryStore";
import { GroceryProduct } from "./GroceryProduct";

@Entity({ name: "GroceryCategories" })
export class GroceryCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column()
  storeId!: number;

  @ManyToOne(() => GroceryStore, (store) => store.categories)
  @JoinColumn({ name: "storeId" })
  store!: GroceryStore;

  @OneToMany(() => GroceryProduct, (product) => product.category)
  products!: GroceryProduct[];
}
