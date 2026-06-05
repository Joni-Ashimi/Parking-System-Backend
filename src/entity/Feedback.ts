import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../entity/User';

@Entity()
export class Feedback {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    subject: string;

    @Column()
    category: string;

    @Column('text')
    message: string;

    @Column('simple-array', { nullable: true })
    photos: string[];

    @Column({ default: 'pending' })
    status: string;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date;
}