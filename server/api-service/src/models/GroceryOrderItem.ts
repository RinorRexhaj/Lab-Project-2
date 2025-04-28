import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { GroceryOrder } from "./GroceryOrder";
import { GroceryProduct } from "./GroceryProduct";

@Entity()
export class GroceryOrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => GroceryOrder, (order) => order.items)
  order!: GroceryOrder;

  @ManyToOne(() => GroceryProduct)
  product!: GroceryProduct;

  @Column()
  quantity!: number;

  @Column({ nullable: true })
  specialInstructions?: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  weight?: string;
}
