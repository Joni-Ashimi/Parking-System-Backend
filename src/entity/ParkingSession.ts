import {
  Entity,
  PrimaryGeneratedColumn,
  Column, ManyToOne, OneToOne, CreateDateColumn
} from 'typeorm';
import {Vehicle} from "./Vehicle";
import {ParkingSpot} from "./ParkingSpot";
import {ParkingSessionStatus} from "../def/ParkingSessionStatus";
import {Transaction} from "./Transaction";

@Entity()
export class ParkingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, { eager: true })
  vehicle: Vehicle;

  @ManyToOne(() => ParkingSpot, (spot) => spot.sessions, { eager: true })
  spot: ParkingSpot;

  @Column({ type: 'timestamp' })
  entryTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  exitTime?: Date;

  @Column({
    type: 'enum',
    enum: ParkingSessionStatus,
    default: ParkingSessionStatus.ACTIVE,
  })
  status: ParkingSessionStatus;

  @Column({ type: 'decimal', nullable: true })
  price?: number;

  @OneToOne(() => Transaction, (t) => t.parkingSession)
  transaction: Transaction;

  @CreateDateColumn()
  createdAt: Date;
}