import {Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {ParkingSession} from "./ParkingSession";
import {TransactionStatus} from "../def/enums/TransactionStatus";

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true, nullable: true}) // remove nullable later (testing purpose)
    sdkOrderId: string;

    @Column({
        type: "enum",
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @CreateDateColumn()
    createdAt: Date;

    @Column({nullable: true, type: 'timestamp'})
    cancelledAt?: Date;

    @OneToOne(() => ParkingSession, (parkingSession) => parkingSession.transaction, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({name: 'parkingSessionId'})
    parkingSession: ParkingSession;

    @Column() // add nullable later
    paymentCurrency: string; // ALL / EUR from user choice in front

    @Column({type: 'decimal'}) // remove nullable : true later
    originalAmount: number;

    @Column({type: 'decimal'})
    finalAmount: number;

    @Column({type: 'timestamp'})
    paymentConfirmedAt?: Date;
}