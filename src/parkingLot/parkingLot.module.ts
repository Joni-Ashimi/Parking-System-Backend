import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ParkingLot} from '../entity/ParkingLot';
import {ParkingLotController} from "./parkingLot.controller";
import {ParkingLotService} from "./parkingLot.service";
import {ParkingSpot} from "../entity/ParkingSpot";

@Module({
    imports: [TypeOrmModule.forFeature([ParkingLot, ParkingSpot])],
    controllers: [ParkingLotController],
    providers: [ParkingLotService],
    exports: [ParkingLotService],
})
export class ParkingLotModule {}