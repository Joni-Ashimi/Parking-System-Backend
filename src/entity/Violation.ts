import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ViolationType} from "../def/enums/ViolationType";
import {ViolationStatus} from "../def/enums/ViolationStatus";
import {User} from "./User";

@Entity("violations")
export class Violation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, {nullable: true, eager: false})
    @JoinColumn({name: "userId"})
    user?: User;

    @Column({
        type: "enum",
        enum: ViolationType,
    })
    type: ViolationType;

    @Column("text")
    description: string;

    @Column("decimal", {precision: 10, scale: 2, nullable: true})
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

    @UpdateDateColumn()
    resolvedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}