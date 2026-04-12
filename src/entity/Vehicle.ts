import {Column, Entity, ManyToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {User} from "./User";
import {VehicleType} from "./../def/enums/VehicleType";

@Entity()
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({unique: true})
    plateNumber: string;

    @Column({
        type: 'enum',
        enum: VehicleType,
    })
    type: VehicleType;

    @ManyToOne(() => User, (user) => user.vehicles)//many vehicle by one user
    user: User;
}