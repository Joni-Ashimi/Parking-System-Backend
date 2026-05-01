import { PartialType } from '@nestjs/mapped-types';
import { CreateParkingSpotDto } from './CreateParkingSpotDto';

export class UpdateParkingSpotDto extends PartialType(CreateParkingSpotDto) {}