import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {ParkingSpotStatus} from "../def/enums/ParkingSpotStatus";
import {ParkingSession} from "./ParkingSession";
import {ParkingLot} from "./ParkingLot";

@Entity()
export class ParkingSpot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    spotNumber: string;

    @Column()
    floor: number;

    @Column({default: false})
    isOccupied: boolean;

    @Column({
        type: 'enum',
        enum: ParkingSpotStatus,
    })
    status: ParkingSpotStatus;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => ParkingSpot, (spot) => spot.sessions)
    sessions: ParkingSession[];

    @ManyToOne(() => ParkingLot, (parkingLot) => parkingLot.spots)
    lot: ParkingLot;
}