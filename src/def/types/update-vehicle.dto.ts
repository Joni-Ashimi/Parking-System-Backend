import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';

// PartialType makes ALL fields from CreateVehicleDto optional
// So you can update just the type, just the plate, or both
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}