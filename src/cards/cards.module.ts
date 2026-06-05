import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { HttpModule } from '@nestjs/axios';
import { PokApiModule } from '../external/pok-api.module';
import { UsersModule } from '../users/users.module';
import {Card} from "../entity/Card";

@Module({
    imports: [
        TypeOrmModule.forFeature([Card]),
        UsersModule,
        HttpModule,
        PokApiModule,
    ],
    controllers: [CardsController],
    providers: [CardsService],
    exports: [CardsService],
})
export class CardsModule {}