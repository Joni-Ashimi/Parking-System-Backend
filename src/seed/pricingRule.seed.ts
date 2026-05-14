import { DataSource } from "typeorm";
import { PricingRule } from "../entity/PricingRule";
import { SpotCategory } from "../entity/SpotCategory";
import { ParkingSpotTypeCode } from "../def/enums/ParkingSpotType";

export async function seedPricingRules(
    dataSource: DataSource,
    categories: SpotCategory[],
): Promise<PricingRule[]> {

    const repo = dataSource.getRepository(PricingRule);

    const existing = await repo.find();
    if (existing.length > 0) {
        console.log("⏭ Pricing rules already exist");
        return existing;
    }

    const car = categories.find(c => c.code === ParkingSpotTypeCode.CAR);

    if (!car) {
        throw new Error("Car category missing");
    }

    const rules: Partial<PricingRule>[] = [
        {
            name: "Weekend Surcharge",
            adjustmentType: "SURCHARGE",
            value: 20,
            dayOfWeek: 0, // Sunday
            startHour: 10,
            endHour: 12,
            spotCategory: car,
        },
        {
            name: "Night Discount",
            adjustmentType: "DISCOUNT",
            value: 10,
            dayOfWeek: 1,
            startHour: 22,
            endHour: 6,
            spotCategory: car,
        },
    ];

    const saved = await repo.save(repo.create(rules));

    console.log(`✅ Seeded ${saved.length} pricing rules`);
    return saved;
}