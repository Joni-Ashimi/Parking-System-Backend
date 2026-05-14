import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {SpotCategory} from "../entity/SpotCategory";
import {ParkingSpot} from "../entity/ParkingSpot";
import {PricingRule} from "../entity/PricingRule";
import {ParkingPricingService} from "./parkingPricing.service";
import {ParkingAdminService} from "./parkingAdmin.service";
import {ParkingPricingController} from "./parkingPricing.controller";
import {ParkingAdminController} from "./parkingAdmin.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SpotCategory,
            ParkingSpot,
            PricingRule,
        ]),
    ],
    providers: [
        ParkingPricingService,
        ParkingAdminService,
    ],
    controllers: [
        ParkingPricingController,
        ParkingAdminController,
    ],
    exports: [
        ParkingPricingService,
        ParkingAdminService,
    ],
})
export class ParkingPricingModule {}