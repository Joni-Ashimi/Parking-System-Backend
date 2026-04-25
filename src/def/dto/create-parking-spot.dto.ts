import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { ParkingSpotStatus } from '../../def/enums/ParkingSpotStatus';

export class CreateParkingSpotDto {
    @IsString()
    spotNumber: string;

    @IsInt()
    @Min(0)
    floor: number;

    @IsEnum(ParkingSpotStatus)
    status: ParkingSpotStatus;

    @IsString()
    lotId: string;
}