import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import {Vehicle} from "./Vehicle";
import {UserType} from "../def/enums/UserType";

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

    @Column()
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column()
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @Column({ default: false })
    isBanned: boolean;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.user)
    vehicles: Vehicle[];
}