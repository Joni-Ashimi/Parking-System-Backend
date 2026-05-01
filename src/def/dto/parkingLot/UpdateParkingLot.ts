import {PartialType} from '@nestjs/mapped-types';
import {CreateParkingLotDto} from "./CreateParkingLot";

export class UpdateParkingLotDto extends PartialType(CreateParkingLotDto) {
}