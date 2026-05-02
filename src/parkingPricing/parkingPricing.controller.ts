import { Controller, Post, Body } from '@nestjs/common';
import {ParkingPricingService} from "./parkingPricing.service";

@Controller('pricing')
export class ParkingPricingController {
    constructor(private pricingService: ParkingPricingService) {}

    @Post('calculate')
    calculate(@Body() body: { spotTypeId: string; hours: number; date?: string }) {
        const { spotTypeId, hours, date } = body;

        return this.pricingService.calculatePrice(
            spotTypeId,
            hours,
            date ? new Date(date) : new Date(),
        );
    }
}