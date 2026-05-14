import { DataSource } from "typeorm";
import { ParkingSpot } from "../entity/ParkingSpot";
import { ParkingSpotStatus } from "../def/enums/ParkingSpotStatus";
import { ParkingLot } from "../entity/ParkingLot";
import { SpotCategory } from "../entity/SpotCategory";
import { ParkingSpotTypeCode } from "../def/enums/ParkingSpotType";

export async function seedParkingSpots(
    dataSource: DataSource,
    lots: ParkingLot[],
    categories: SpotCategory[],
): Promise<ParkingSpot[]> {

    const repo = dataSource.getRepository(ParkingSpot);

    const existing = await repo.find();

    if (existing.length > 0) {
        console.log("⏭ Parking spots already exist");
        return existing;
    }

    const car = categories.find(c => c.code === ParkingSpotTypeCode.CAR);
    const truck = categories.find(c => c.code === ParkingSpotTypeCode.TRUCK);
    const moto = categories.find(c => c.code === ParkingSpotTypeCode.MOTORCYCLE);

    if (!car || !truck || !moto) {
        throw new Error("Missing SpotCategories (seed order issue)");
    }

    const spotDefs: Partial<ParkingSpot>[] = [
        // LOT 1
        { spotNumber: "A-01", floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[0], type: car },
        { spotNumber: "A-02", floor: 1, status: ParkingSpotStatus.OCCUPIED, lot: lots[0], type: car },
        { spotNumber: "A-03", floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[0], type: moto },
        { spotNumber: "B-01", floor: 2, status: ParkingSpotStatus.RESERVED, lot: lots[0], type: truck },

        // LOT 2
        { spotNumber: "A-01", floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[1], type: car },
        { spotNumber: "A-02", floor: 1, status: ParkingSpotStatus.OCCUPIED, lot: lots[1], type: car },
        { spotNumber: "A-03", floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[1], type: moto },
        { spotNumber: "B-01", floor: 2, status: ParkingSpotStatus.RESERVED, lot: lots[1], type: truck },

        // LOT 3
        { spotNumber: "A-01", floor: 1, status: ParkingSpotStatus.AVAILABLE, lot: lots[2], type: car },
        { spotNumber: "A-02", floor: 1, status: ParkingSpotStatus.OCCUPIED, lot: lots[2], type: moto },
        { spotNumber: "B-01", floor: 2, status: ParkingSpotStatus.AVAILABLE, lot: lots[2], type: truck },
    ];

    const saved = await repo.save(repo.create(spotDefs));

    console.log(`✅ Seeded ${saved.length} parking spots`);
    return saved;
}