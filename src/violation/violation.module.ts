import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {Violation} from "../entity/Violation";
import {ViolationsController} from "./violation.controller";
import {ViolationsService} from "./violation.service";

@Module({
    imports: [TypeOrmModule.forFeature([Violation])],
    controllers: [ViolationsController],
    providers: [ViolationsService],
})
export class ViolationModule {}