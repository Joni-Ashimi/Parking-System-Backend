import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    DeleteDateColumn, OneToMany,
} from 'typeorm';
import {ParkingSpot} from "./ParkingSpot";

@Entity('parkingLot')
export class ParkingLot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column()
    totalSpots: number;

    @OneToMany(() => ParkingSpot, (spot) => spot.lot)
    spots: ParkingSpot[];

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}