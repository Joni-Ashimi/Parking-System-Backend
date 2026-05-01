import { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';
import { seedVehicles } from './vehicle.seed';
import { AppDataSource } from "../datasource";
import {seedParkingLots} from "./parkingLot.seed";
import {seedParkingSpots} from "./parkingSpot.seed";
const {seedParkingSessions} = require('./parkingSession.seed');


async function runSeeds(dataSource: DataSource) {
    console.log('\n🌱 Starting database seeding...\n');

    const users    = await seedUsers(dataSource);
    const vehicles = await seedVehicles(dataSource, users);
    const lots     = await seedParkingLots(dataSource);
    const spots    = await seedParkingSpots(dataSource, lots);
    await seedParkingSessions(dataSource, vehicles, spots, users);

    console.log('\n✅ All seeds completed successfully.\n');
}

AppDataSource.initialize()
    .then((ds) => runSeeds(ds))
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    });