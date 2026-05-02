import {Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,} from 'typeorm';
import {Vehicle} from "./Vehicle";
import {UserType} from "../def/enums/UserType";
import {UserVerificationStatus} from "../def/enums/UserVerificationStatus";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.GUEST,
    })
    type: UserType;

    @Column({nullable: false})
    name: string;

    @Column({nullable: true, unique: true})
    phoneNumber: string;

    @Column({nullable: true, unique: true})
    email: string;

    @Column()
    password: string;

    @Column({nullable: true})
    lastPasswordResetAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ default: 0 })
    tokenVersion: number;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @Column({type: "enum", enum: UserVerificationStatus, default: UserVerificationStatus.PENDING})
    verificationStatus: UserVerificationStatus

    @Column({ type: 'text', nullable: true})
    profileImageUrl?: string | null;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
    vehicles: Vehicle[];
}