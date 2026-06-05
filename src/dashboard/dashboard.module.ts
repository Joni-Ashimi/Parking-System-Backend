import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ParkingSession} from '../entity/ParkingSession';
import {TransactionsModule} from '../transactions/transactions.module';
import {ParkingSpot} from "../entity/ParkingSpot";
import {User} from "../entity/User";
import {DashboardService} from "./dashboard.service";
import {DashboardController} from "./dashboard.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([ParkingSession, ParkingSpot, User]),
        TransactionsModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule {
}