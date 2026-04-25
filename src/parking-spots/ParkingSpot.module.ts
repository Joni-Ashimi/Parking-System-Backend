import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ParkingSpot} from "../entity/ParkingSpot";
import {ParkingSpotController} from "./ParkingSpot.controller";
import {ParkingSpotService} from "./ParkingSpot.service";

@Module({
  imports: [TypeOrmModule.forFeature([ParkingSpot])],
  controllers: [ParkingSpotController],
  providers: [ParkingSpotService],
  exports: [ParkingSpotService],
})
export class ParkingSpotModule {}
