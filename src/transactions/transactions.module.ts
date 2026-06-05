import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokApiModule } from '../external/pok-api.module';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RedisModule } from '../redis/redis.module';
import {Transaction} from "../entity/Transaction";
import {ParkingSession} from "../entity/ParkingSession";
import {Card} from "../entity/Card";
import {CardsModule} from "../cards/cards.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, ParkingSession, Card]),
        PokApiModule,
        RedisModule,
        CardsModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}