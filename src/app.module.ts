import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {ScheduleModule} from '@nestjs/schedule';
import {CONFIG} from './dynamic-module/config';
import {DB} from './dynamic-module/db';
import {UsersModule} from "./users/users.module";
import {ParkingSpotModule} from './parkingSpot/ParkingSpot.module';
import {ParkingLotModule} from "./parkingLot/parkingLot.module";
import {VehiclesModule} from "./vehicles/vehicles.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        CONFIG,
        DB,
        UsersModule,
        AuthModule,
        ParkingSpotModule,
        ParkingLotModule,
        VehiclesModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}