import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ParkingSpotType} from "./ParkingSpotType";

@Entity()
export class PricingRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ['DISCOUNT', 'SURCHARGE'],
    })
    type: 'DISCOUNT' | 'SURCHARGE';

    @Column('decimal')
    value: number; // percentage (e.g. 10 = 10%)

    // optional time constraints
    @Column({ nullable: true })
    dayOfWeek: number; // 0–6 (Sunday–Saturday)

    @Column({ nullable: true })
    startHour: number;

    @Column({ nullable: true })
    endHour: number;

    @ManyToOne(() => ParkingSpotType, (type) => type.rules)
    parkingSpotType: ParkingSpotType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}