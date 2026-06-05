import {Body, Controller, Delete, Get, Param, Patch, Post, Query,} from "@nestjs/common";
import {ViolationsService} from "./violation.service";
import {CreateViolationDto} from "../def/dto/violation/CreateViolationDto";
import {UpdateViolationDto} from "../def/dto/violation/UpdateViolationDto";
import {ViolationsQuery} from "../def/pagination-query";

@Controller("violations")
export class ViolationsController {
    constructor(private readonly service: ViolationsService) {
    }

    @Get('stats')
    getStats() {
        return this.service.getStats();
    }

    @Post()
    create(@Body() dto: CreateViolationDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query() query: ViolationsQuery) {
        return this.service.findAll(query);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.service.findOne(id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateViolationDto) {
        return this.service.updateStatus(id, dto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.service.remove(id);
    }
}