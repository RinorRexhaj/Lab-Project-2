import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
@Entity({ name: "Rides" })
export class Ride {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => User)
  driver!: User;

  @Column()
  pickupLocation!: string;

  @Column()
  dropoffLocation!: string;

  @Column({ default: "pending" }) // pending, accepted, rejected
  status!: "pending" | "accepted" | "rejected";
}
