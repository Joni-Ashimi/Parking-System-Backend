import {
  Entity,
  PrimaryGeneratedColumn,
  Column, ManyToOne, OneToOne, CreateDateColumn
} from 'typeorm';
import {Vehicle} from "./Vehicle";
import {ParkingSpot} from "./ParkingSpot";
import {ParkingSessionStatus} from "../def/enums/ParkingSessionStatus";
import {Transaction} from "./Transaction";
import {User} from "./User";

@Entity()
export class ParkingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}