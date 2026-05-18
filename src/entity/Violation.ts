import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ViolationType} from "../def/enums/ViolationType";
import {ViolationStatus} from "../def/enums/ViolationStatus";

@Entity("violations")
export class Violation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Index()
    userId: string;

    @Column({
        type: "enum",
        enum: ViolationType,
    })
    type: ViolationType;

    @Column("text")
    description: string;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    penaltyAmount: number;

    @Column({
        type: "enum",
        enum: ViolationStatus,
        default: ViolationStatus.PENDING,
    })
    status: ViolationStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}