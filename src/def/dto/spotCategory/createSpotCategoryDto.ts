import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import {ParkingSpotTypeCode} from "../../enums/ParkingSpotType";
import {SpotSize} from "../../enums/SpotSize";

export class CreateSpotCategoryDto {
    @IsEnum(ParkingSpotTypeCode)
    @IsNotEmpty()
    code: ParkingSpotTypeCode;

    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "Electric Vehicle", "Motorcycle"

    @IsEnum(SpotSize)
    @IsNotEmpty()
    size: SpotSize; // "small", "medium", "large"

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    baseHourlyRate: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    baseDailyRate: number;
}