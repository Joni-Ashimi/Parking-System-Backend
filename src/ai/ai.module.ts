import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../entity/Conversation';
import { ChatMessage } from '../entity/ChatMessage';
import { ParkingSpotModule } from '../parkingSpot/ParkingSpot.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { ParkingSessionModule } from '../parkingSession/parkingSession.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ChatMessage]),
    ParkingSpotModule,
    VehiclesModule,
    ParkingSessionModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
