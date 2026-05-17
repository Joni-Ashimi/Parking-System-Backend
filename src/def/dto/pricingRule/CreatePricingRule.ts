import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreatePricingRuleDto {
    @IsString()
    name: string; // e.g., "Early Bird Special"

    @IsEnum(['DISCOUNT', 'SURCHARGE'])
    adjustmentType: 'DISCOUNT' | 'SURCHARGE';

    @IsNumber()
    @Min(0)
    @Max(100)
    value: number; // e.g., 20.00 for 20%

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek?: number; // 0 (Sunday) to 6 (Saturday)

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(23)
    startHour?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(23)
    endHour?: number;

    @IsUUID()
    spotCategoryId: string; // Ties the offer to a vehicle tier (Car, Bike, Truck)
}