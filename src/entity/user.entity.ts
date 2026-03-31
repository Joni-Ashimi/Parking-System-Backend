import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

export enum UserType { 
  GUEST = 'guest',
  REGISTERED = 'registered',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ //user can be eithe guest or logged in
    type: 'enum',
    enum: UserType,
    default: UserType.GUEST,
  })
  type: UserType;

  @Column({ nullable: true }) // guests dont need email
  email: string;

  @Column({ default: false }) //for the ban feature
  isBanned: boolean;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user) // one use can have many cars
  vehicles: Vehicle[];
}