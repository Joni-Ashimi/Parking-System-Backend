import {IsEnum, IsInt, IsNotEmpty, IsString, Min} from 'class-validator';
import {ParkingSpotStatus} from "../../enums/ParkingSpotStatus";

export class CreateParkingSpotDto {
    @IsString()
    @IsNotEmpty()
    spotNumber: string;

    @IsInt()
    @Min(0)
    floor: number;

    @IsEnum(ParkingSpotStatus)
    status: ParkingSpotStatus;

    @IsString()
    @IsNotEmpty()
    lotId: string;

    @IsNotEmpty()
    typeId: string;
}