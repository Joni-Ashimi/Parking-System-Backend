import { AppDataSource } from "../datasource";
import { DataSource } from "typeorm";

import { seedUsers } from "./user.seed";
import { seedVehicles } from "./vehicle.seed";
import { seedParkingLots } from "./parkingLot.seed";
import { seedSpotCategories} from "./spotCategorySeed";
import { seedParkingSpots } from "./parkingSpot.seed";
import { seedPricingRules } from "./pricingRule.seed";
const { seedParkingSessions } = require("./parkingSession.seed");

async function resetDatabase(dataSource: DataSource) {
    console.log("🧨 Clearing database...");

    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
        const repo = dataSource.getRepository(entity.name);
        await repo.query(
            `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`
        );
    }

    console.log("✅ Database cleared");
}

async function seedAll(dataSource: DataSource) {
    console.log("\n🌱 SEED START\n");

    const users = await seedUsers(dataSource);
    const vehicles = await seedVehicles(dataSource, users);
    const categories = await seedSpotCategories(dataSource);
    const lots = await seedParkingLots(dataSource);
    const spots = await seedParkingSpots(dataSource, lots, categories);
    const rules = await seedPricingRules(dataSource, categories);

    await seedParkingSessions(dataSource, vehicles, spots, users);

    console.log("\n🎉 SEED COMPLETE\n");
}

// CLI ENTRY POINT
async function main() {
    const mode = process.argv[2]; // "reset" or "seed"

    await AppDataSource.initialize();

    if (mode === "reset") {
        await resetDatabase(AppDataSource);
    }

    await seedAll(AppDataSource);

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});