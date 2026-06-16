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
import {ParkingSpotTypeCode} from "../def/enums/ParkingSpotType";

@Entity()
export class SpotCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ParkingSpotTypeCode,
        unique: true,
    })
    code: ParkingSpotTypeCode;

    @Column()
    name: string;

    @Column()
    size: string;

    @Column('decimal')
    baseHourlyRate: number;

    @Column('decimal')
    baseDailyRate: number;

    @OneToMany(() => ParkingSpot, (spot) => spot.type)
    spots: ParkingSpot[];

    @OneToMany(() => PricingRule, (rule) => rule.spotCategory)
    rules: PricingRule[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}