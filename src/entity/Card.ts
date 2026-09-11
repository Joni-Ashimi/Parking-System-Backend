import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pokCardId: string;

  @Column()
  hiddenNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.creditCards, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
