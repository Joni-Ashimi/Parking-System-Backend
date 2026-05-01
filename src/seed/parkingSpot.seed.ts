import { DataSource } from 'typeorm';
import { ParkingSpot } from '../entity/ParkingSpot';
import { ParkingSpotStatus } from '../def/enums/ParkingSpotStatus';
import { ParkingLot } from '../entity/ParkingLot';

export async function seedParkingSpots(
    dataSource: DataSource,
    lots: ParkingLot[],
): Promise<ParkingSpot[]> {
    const repo = dataSource.getRepository(ParkingSpot);

    const existing = await repo.count();
    if (existing > 0) {
        console.log('⏭  Parking spots already seeded, skipping.');
        return repo.find({ relations: ['lot'] });
    }

    // Spread spots across the first 3 lots, 2 floors each
    const spotDefs: Partial<ParkingSpot>[] = [
        // City Center Parking — Floor 1
        { spotNumber: 'A-01', floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[0] },
        { spotNumber: 'A-02', floor: 1, status: ParkingSpotStatus.OCCUPIED,  lot: lots[0] },
        { spotNumber: 'A-03', floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[0] },
        // City Center Parking — Floor 2
        { spotNumber: 'B-01', floor: 2, status: ParkingSpotStatus.RESERVED,  lot: lots[0] },
        { spotNumber: 'B-02', floor: 2, status: ParkingSpotStatus.AVAILABLE, lot: lots[0] },

        // Airport Lot A — Floor 1
        { spotNumber: 'A-01', floor: 1, status: ParkingSpotStatus.OCCUPIED,  lot: lots[1] },
        { spotNumber: 'A-02', floor: 1, status: ParkingSpotStatus.OCCUPIED,  lot: lots[1] },
        { spotNumber: 'A-03', floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[1] },
        // Airport Lot A — Floor 2
        { spotNumber: 'B-01', floor: 2, status: ParkingSpotStatus.AVAILABLE, lot: lots[1] },
        { spotNumber: 'B-02', floor: 2, status: ParkingSpotStatus.RESERVED,  lot: lots[1] },

        // Blloku Parking — Floor 1
        { spotNumber: 'A-01', floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[2] },
        { spotNumber: 'A-02', floor: 1, status: ParkingSpotStatus.OCCUPIED,  lot: lots[2] },
        // Blloku Parking — Floor 2
        { spotNumber: 'B-01', floor: 2, status: ParkingSpotStatus.AVAILABLE, lot: lots[2] },
        { spotNumber: 'B-02', floor: 2, status: ParkingSpotStatus.AVAILABLE, lot: lots[2] },
    ];

    const spots = repo.create(spotDefs);
    const saved = await repo.save(spots);
    console.log(`✅ Seeded ${saved.length} parking spots.`);
    return saved;
}