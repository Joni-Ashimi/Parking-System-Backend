import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {NotificationsController} from "./notications.controller";
import {Notification} from "../entity/Notification";

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [NotificationsService],
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationModule {}