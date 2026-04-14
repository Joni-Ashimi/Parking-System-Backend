import { IsEnum, IsString, Matches } from 'class-validator';
import { VehicleType } from '../../def/enums/VehicleType';

export class CreateVehicleDto {
    @IsString()
    @Matches(/^[A-Z0-9]{2,10}$/, {
        message: 'Plate number must be 2-10 uppercase letters/numbers',
    })
    plateNumber: string;

    @IsEnum(VehicleType, {
        message: `type must be one of: ${Object.values(VehicleType).join(', ')}`,
    })
    type: VehicleType;
}