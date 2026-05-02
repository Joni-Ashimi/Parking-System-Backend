import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ParkingSpotType} from "../entity/ParkingSpotType";
import {ParkingSpot} from "../entity/ParkingSpot";
import {PricingRule} from "../entity/PricingRule";
import {ParkingPricingService} from "./parkingPricing.service";
import {ParkingAdminService} from "./parkingAdmin.service";
import {ParkingPricingController} from "./parkingPricing.controller";
import {ParkingAdminController} from "./parkingAdmin.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ParkingSpotType,
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