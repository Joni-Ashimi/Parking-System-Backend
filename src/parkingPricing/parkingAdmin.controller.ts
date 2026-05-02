import { Controller, Get, Put, Post, Delete, Param, Body } from '@nestjs/common';
import {ParkingAdminService} from "./parkingAdmin.service";

@Controller('admin/parking-pricing')
export class ParkingAdminController {
    constructor(private adminService: ParkingAdminService) {}

    @Get()
    getAll() {
        return this.adminService.getAllTypes();
    }

    @Put(':typeId')
    updateBase(@Param('typeId') typeId: string, @Body() body: { baseHourlyRate: number; baseDailyRate: number }) {
        return this.adminService.updateBasePricing(typeId, body);
    }

    @Post(':typeId/rules')
    createRule(@Param('typeId') typeId: string, @Body() body) {
        return this.adminService.createRule(typeId, body);
    }

    @Delete('rules/:ruleId')
    deleteRule(@Param('ruleId') ruleId: string) {
        return this.adminService.deleteRule(ruleId);
    }
}