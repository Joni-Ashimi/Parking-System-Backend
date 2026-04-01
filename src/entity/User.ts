import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import {UserType} from "../def/UserType";
import {Vehicle} from "./Vehicle";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.GUEST,
    })
    type: UserType;

    @Column({ nullable: true }) // guests dont need email
    email: string;

    @Column({ default: false })
    isBanned: boolean;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
    vehicles: Vehicle[];
}