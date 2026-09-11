import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from './Vehicle';
import { UserType } from '../def/enums/UserType';
import { UserVerificationStatus } from '../def/enums/UserVerificationStatus';
import { Gender } from '../def/enums/UserGender';
import { Card } from './Card';
import { ParkingSession } from './ParkingSession';
import { Conversation } from './Conversation';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.GUEST,
  })
  type: UserType;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  lastPasswordResetAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  tokenVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({
    type: 'enum',
    enum: UserVerificationStatus,
    default: UserVerificationStatus.PENDING,
  })
  verificationStatus: UserVerificationStatus;

  @Column({ nullable: true })
  bannedUntil?: Date;

  @Column({ type: 'text', nullable: true })
  profileImageUrl?: string | null;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => Card, (creditCard) => creditCard.user, {
    onDelete: 'SET NULL',
  })
  creditCards: Card[];

  @OneToMany(() => ParkingSession, (parkingSession) => parkingSession.user)
  parkingSessions: ParkingSession[];

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];
}
