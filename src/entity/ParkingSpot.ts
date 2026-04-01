import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import {ParkingSession} from "./ParkingSession";

@Entity()
export class ParkingSpot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    spotNumber: number;

    @Column()
    floor: number;

    @Column({ default: false })
    isOccupied: boolean;

    @OneToMany(() => ParkingSession, (session) => session.spot)
    sessions: ParkingSession[];
}