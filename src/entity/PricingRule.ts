import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SpotCategory } from './SpotCategory';

@Entity('pricingRules')
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['DISCOUNT', 'SURCHARGE'],
  })
  adjustmentType: 'DISCOUNT' | 'SURCHARGE';

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  value: number; // percentage (e.g. 10 = 10%)

  // optional time constraints
  @Column({ nullable: true })
  dayOfWeek: number; // 0–6 (Sunday–Saturday)

  @Column({ nullable: true })
  startHour: number;

  @Column({ nullable: true })
  endHour: number;

  @ManyToOne(() => SpotCategory, (type) => type.rules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'spotCategoryId' })
  spotCategory: SpotCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
