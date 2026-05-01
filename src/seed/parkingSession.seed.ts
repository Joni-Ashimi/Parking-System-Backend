import { DataSource } from 'typeorm';
import { ParkingSession } from '../entity/ParkingSession';
import { ParkingSessionStatus } from '../def/enums/ParkingSessionStatus';
import { Vehicle } from '../entity/Vehicle';
import { ParkingSpot } from '../entity/ParkingSpot';
import { User } from '../entity/User';

const hoursAgo = (h: number) => {
    const d = new Date();
    d.setHours(d.getHours() - h);
    return d;
};

export async function seedParkingSessions(
    dataSource: DataSource,
    vehicles: Vehicle[],
    spots: ParkingSpot[],
    users: User[],
): Promise<ParkingSession[]> {
    const repo = dataSource.getRepository(ParkingSession);

    const existing = await repo.count();
    if (existing > 0) {
        console.log('⏭  Parking sessions already seeded, skipping.');
        return repo.find({ relations: ['vehicle', 'spot', 'user'] });
    }

    const sessions = repo.create([
        // Completed sessions
        {
            vehicle: vehicles[0],
            spot: spots[0],
            user: users[0],
            entryTime: hoursAgo(5),
            exitTime: hoursAgo(3),
            status: ParkingSessionStatus.COMPLETED,
            price: 4.00,
        },
        {
            vehicle: vehicles[1],
            spot: spots[2],
            user: users[1],
            entryTime: hoursAgo(8),
            exitTime: hoursAgo(6),
            status: ParkingSessionStatus.COMPLETED,
            price: 3.00,
        },
        {
            vehicle: vehicles[3],
            spot: spots[7],
            user: users[2],
            entryTime: hoursAgo(24),
            exitTime: hoursAgo(22),
            status: ParkingSessionStatus.COMPLETED,
            price: 2.50,
        },
        {
            vehicle: vehicles[4],
            spot: spots[10],
            user: users[3],
            entryTime: hoursAgo(48),
            exitTime: hoursAgo(45),
            status: ParkingSessionStatus.COMPLETED,
            price: 6.00,
        },
        // Active sessions (no exitTime, no price yet)
        {
            vehicle: vehicles[2],
            spot: spots[1],  // OCCUPIED spot
            user: users[1],
            entryTime: hoursAgo(2),
            status: ParkingSessionStatus.ACTIVE,
        },
        {
            vehicle: vehicles[5],
            spot: spots[5],  // OCCUPIED spot
            user: users[4],
            entryTime: hoursAgo(1),
            status: ParkingSessionStatus.ACTIVE,
        },
        {
            vehicle: vehicles[6],
            spot: spots[6],  // OCCUPIED spot
            user: users[4],
            entryTime: hoursAgo(3),
            status: ParkingSessionStatus.ACTIVE,
        },
        // Cancelled session
        {
            vehicle: vehicles[7],
            spot: spots[11],
            user: users[7],
            entryTime: hoursAgo(10),
            exitTime: hoursAgo(10),
            status: ParkingSessionStatus.CANCELLED,
            price: 0,
        },
    ]);

    const saved = await repo.save(sessions);
    console.log(`✅ Seeded ${saved.length} parking sessions.`);
    return saved;
}