import { DataSource } from 'typeorm';
import { ParkingLot } from '../entity/ParkingLot';

export async function seedParkingLots(dataSource: DataSource): Promise<ParkingLot[]> {
    const repo = dataSource.getRepository(ParkingLot);

    const existing = await repo.count();
    if (existing > 0) {
        console.log('⏭  Parking lots already seeded, skipping.');
        return repo.find();
    }

    const lots = repo.create([
        {
            name: 'City Center Parking',
            location: 'Sheshi Skënderbej, Tirana',
            capacity: 120,
        },
        {
            name: 'Airport Lot A',
            location: 'Rinas International Airport, Tirana',
            capacity: 300,
        },
        {
            name: 'Blloku Parking',
            location: 'Rruga Ismail Qemali, Tirana',
            capacity: 80,
        },
        {
            name: 'University Lot',
            location: 'Bulevardi Zogu I, Tirana',
            capacity: 60,
        },
        {
            name: 'QTU Shopping Mall',
            location: 'Autostrada Tiranë-Durrës, km 5',
            capacity: 500,
        },
        {
            name: 'Lake Park Parking',
            location: 'Parku Artificial, Tirana',
            capacity: 150,
        },
        {
            name: 'Train Station Lot',
            location: 'Stacioni i Trenit, Tirana',
            capacity: 90,
        },
    ]);

    const saved = await repo.save(lots);
    console.log(`✅ Seeded ${saved.length} parking lots.`);
    return saved;
}