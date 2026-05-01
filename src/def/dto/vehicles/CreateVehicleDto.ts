import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { VehicleType } from '../../enums/VehicleType';

export class CreateVehicleDto {
    @IsNotEmpty()
    plateNumber: string;

    @IsEnum(VehicleType )
    type: VehicleType;

    @IsUUID()
    userId: string;
}