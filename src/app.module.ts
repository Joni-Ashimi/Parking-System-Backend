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
import {RedisModule} from "./redis/redis.module";
import {EmailModule} from "./email/email.module";
import {ConfigModule} from '@nestjs/config';
import {ViolationModule} from "./violation/violation.module";
import {CloudinaryModule} from "./cloudinary/cloudinary.module";
import {NotificationModule} from "./notifications/notifications.module";
import {SpotCategoryModule} from "./spotCategory/spotCategory.module";
import {PricingRuleModule} from "./pricingRule/pricingRule.module";
import {ChatModule} from "./chat/chat.module";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        CONFIG,
        DB,
        UsersModule,
        AuthModule,
        ParkingSpotModule,
        ParkingLotModule,
        VehiclesModule,
        RedisModule,
        EmailModule,
        ViolationModule,
        CloudinaryModule,
        NotificationModule,
        SpotCategoryModule,
        PricingRuleModule,
        ChatModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}