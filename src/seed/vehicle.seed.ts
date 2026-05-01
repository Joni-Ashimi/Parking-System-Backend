import { DataSource } from 'typeorm';
import { Vehicle } from '../entity/Vehicle';
import { VehicleType } from '../def/enums/VehicleType';
import { User } from '../entity/User';

export async function seedVehicles(dataSource: DataSource, users: User[]): Promise<Vehicle[]> {
    const repo = dataSource.getRepository(Vehicle);

    // Distribute vehicles across the first 5 users
    const vehicles = repo.create([
        {
            plateNumber: 'AA-001-BB',
            type: VehicleType.CAR,
            isDefault: true,
            user: users[0],
        },
        {
            plateNumber: 'AB-123-CD',
            type: VehicleType.CAR,
            isDefault: true,
            user: users[1],
        },
        {
            plateNumber: 'TR-456-KM',
            type: VehicleType.TRUCK,
            isDefault: false,
            user: users[1],
        },
        {
            plateNumber: 'MC-789-ZZ',
            type: VehicleType.MOTORCYCLE,
            isDefault: true,
            user: users[2],
        },
        {
            plateNumber: 'BS-321-AL',
            type: VehicleType.BUS,
            isDefault: true,
            user: users[3],
        },
        {
            plateNumber: 'AA-654-XY',
            type: VehicleType.CAR,
            isDefault: true,
            user: users[4],
        },
        {
            plateNumber: 'MC-111-TT',
            type: VehicleType.MOTORCYCLE,
            isDefault: false,
            user: users[4],
        },
        {
            plateNumber: 'TR-999-GH',
            type: VehicleType.TRUCK,
            isDefault: true,
            user: users[7],
        },
    ]);

    const saved = await repo.save(vehicles);
    console.log(`✅ Seeded ${saved.length} vehicles.`);
    return saved;
}