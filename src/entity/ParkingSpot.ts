import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn,} from 'typeorm';
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

    @Column({
        type: 'enum',
        enum: ParkingSpotStatus,
    })
    status: ParkingSpotStatus;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => ParkingSession, (session) => session.spot)
    sessions: ParkingSession[];

    @ManyToOne(() => ParkingLot, (parkingLot) => parkingLot.spots)
    lot: ParkingLot;
}