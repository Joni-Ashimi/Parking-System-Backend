import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Vehicle} from "../entity/Vehicle";
import {VehicleController} from "./vehicles.controller";
import {VehicleService} from "./vehicles.service";
import {User} from "../entity/User";

@Module({
    imports: [TypeOrmModule.forFeature([Vehicle, User])],
    controllers: [VehicleController],
    providers: [VehicleService],
    exports: [VehicleService],
})
export class VehiclesModule {}