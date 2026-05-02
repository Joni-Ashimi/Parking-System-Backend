import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ParkingSpot} from "./ParkingSpot";
import {PricingRule} from "./PricingRule";

@Entity()
export class ParkingSpotType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // Car, Truck, Bike

    @Column()
    size: string; // Small, Standard, Large

    @Column('decimal')
    baseHourlyRate: number;

    @Column('decimal')
    baseDailyRate: number;

    @OneToMany(() => ParkingSpot, (spot) => spot.type)
    spots: ParkingSpot[];

    @OneToMany(() => PricingRule, (rule) => rule.type)
    rules: PricingRule[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}