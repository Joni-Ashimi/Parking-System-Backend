import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import {User} from "./User";
import {VehicleType} from "../def/VehicleType";

@Entity()
export class Vehicle{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    plateNumber: string;

    @Column({
        type: 'enum',
        enum: VehicleType,
    })
    type: VehicleType;

    @ManyToOne(() => User, (user) => user.vehicles)//many vehicle by one user
    user: User;
}