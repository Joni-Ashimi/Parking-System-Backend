import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ParkingSession} from '../entity/ParkingSession';
import {TransactionsModule} from '../transactions/transactions.module';
import {ParkingSessionService} from "./parkingSession.service";
import {ParkingSessionController} from "./parkingSession.controller";
import {ParkingSpot} from "../entity/ParkingSpot";
import {Vehicle} from "../entity/Vehicle";

@Module({
    imports: [
        TypeOrmModule.forFeature([ParkingSession, ParkingSpot, Vehicle, ParkingSpot]),
        TransactionsModule,
    ],
    controllers: [ParkingSessionController],
    providers: [ParkingSessionService],
    exports: [ParkingSessionService],
})
export class ParkingSessionModule {
}