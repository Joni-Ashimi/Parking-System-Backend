import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PokApiService } from './pok-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokApiController } from './pok-api.controller';
import {Transaction} from "../entity/Transaction";
@Module({
    imports: [HttpModule, ConfigModule, TypeOrmModule.forFeature([Transaction])],
    controllers: [PokApiController],
    providers: [PokApiService],
    exports: [PokApiService],
})
export class PokApiModule {}