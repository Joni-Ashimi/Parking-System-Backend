import {
    Column,
    CreateDateColumn, DeleteDateColumn,
    Entity, JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {ParkingSpotStatus} from "../def/enums/ParkingSpotStatus";
import {ParkingSession} from "./ParkingSession";
import {ParkingLot} from "./ParkingLot";
import {SpotCategory} from "./SpotCategory";

@Entity()
export class ParkingSpot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true})
    spotNumber: string;

    @Column()
    floor: number;

    @Column({
        type: 'enum',
        enum: ParkingSpotStatus,
    })
    status: ParkingSpotStatus;

    @ManyToOne(() => SpotCategory, (type) => type.spots, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'typeId' })
    type: SpotCategory;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => ParkingSession, (session) => session.spot)
    sessions: ParkingSession[];

    @ManyToOne(() => ParkingLot, (parkingLot) => parkingLot.spots, {
        nullable: false,
    })
    @JoinColumn({ name: 'lotId' })
    lot: ParkingLot;
}