import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    DeleteDateColumn, ManyToOne,
} from 'typeorm';
import {User} from "./User";
import {ParkingSession} from "./ParkingSession";

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => ParkingSession)
    parkingSession: ParkingSession;

    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}