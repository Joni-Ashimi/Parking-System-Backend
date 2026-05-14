import { DataSource } from "typeorm";
import { SpotCategory } from "../entity/SpotCategory";
import { ParkingSpotTypeCode } from "../def/enums/ParkingSpotType";

export async function seedSpotCategories(
    dataSource: DataSource,
): Promise<SpotCategory[]> {

    const repo = dataSource.getRepository(SpotCategory);

    const existing = await repo.find();

    if (existing.length > 0) {
        console.log("⏭ Spot categories already exist");
        return existing;
    }

    const data: Partial<SpotCategory>[] = [
        {
            code: ParkingSpotTypeCode.MOTORCYCLE,
            name: "Motorcycle",
            size: "Small",
            baseHourlyRate: 1,
            baseDailyRate: 10,
        },
        {
            code: ParkingSpotTypeCode.CAR,
            name: "Car",
            size: "Standard",
            baseHourlyRate: 3,
            baseDailyRate: 25,
        },
        {
            code: ParkingSpotTypeCode.TRUCK,
            name: "Truck",
            size: "Large",
            baseHourlyRate: 5,
            baseDailyRate: 40,
        },
    ];

    const saved = await repo.save(repo.create(data));

    console.log(`✅ Seeded ${saved.length} spot categories`);
    return saved;
}