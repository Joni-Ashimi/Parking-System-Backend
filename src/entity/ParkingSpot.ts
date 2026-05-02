import {
    Column,
    CreateDateColumn, DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {ParkingSpotStatus} from "../def/enums/ParkingSpotStatus";
import {ParkingSession} from "./ParkingSession";
import {ParkingLot} from "./ParkingLot";
import {ParkingSpotType} from "./ParkingSpotType";

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

    @ManyToOne(() => ParkingSpotType, (type) => type.spots)
    type: ParkingSpotType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => ParkingSession, (session) => session.spot)
    sessions: ParkingSession[];

    @ManyToOne(() => ParkingLot, (parkingLot) => parkingLot.spots)
    lot: ParkingLot;
}