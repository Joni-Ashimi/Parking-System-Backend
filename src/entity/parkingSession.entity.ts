import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, ManyToOne
 } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { ParkingSpot } from './parkingSpot.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity()
export class ParkingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle) // simple relation bc the vehicle doesnt need to know/store data about the sessions
  vehicle: Vehicle;

  @ManyToOne(() => ParkingSpot, (spot) => spot.sessions) //many session  for a single parking spot, the spot keeps data about it
  spot: ParkingSpot;

  @Column()
  entryTime: Date;

  @Column({ nullable: true })
  exitTime: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({ nullable: true, type: 'float' }) // e bera me chat ket lol
  price: number;
}