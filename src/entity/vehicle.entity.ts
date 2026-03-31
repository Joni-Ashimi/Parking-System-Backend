import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  TRUCK = 'truck',
  BUS = "bus",
} // all the types/sizes  of vehicles,  just a simple idea, maybe changed?

@Entity()
export class Vehicle{ // still use id for the db, can have problems with plates as pk
    @PrimaryGeneratedColumn()
    id: number

    @Column()
  plateNumber: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @ManyToOne(() => User, (user) => user.vehicles)//many vehicle by one user 
  user: User;
}