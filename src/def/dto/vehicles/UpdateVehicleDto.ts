import {PartialType} from '@nestjs/mapped-types';
import {CreateVehicleDto} from "./CreateVehicleDto";

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
}