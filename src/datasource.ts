import { DataSource, DefaultNamingStrategy } from 'typeorm';
import * as dotenv from 'dotenv';
import {Transaction} from "./entity/Transaction";
import {ParkingLot} from "./entity/ParkingLot";
import {ParkingSession} from "./entity/ParkingSession";
import {ParkingSpot} from "./entity/ParkingSpot";
import {User} from "./entity/User";
import {Vehicle} from "./entity/Vehicle";

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Notification, Transaction, ParkingLot, ParkingSession, ParkingSpot, User, Vehicle],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    namingStrategy: new DefaultNamingStrategy(),
});