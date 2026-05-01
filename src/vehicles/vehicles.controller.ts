import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {VehicleService} from "./vehicles.service";
import {CreateVehicleDto} from "../def/dto/vehicles/CreateVehicleDto";
import {UpdateVehicleDto} from "../def/dto/vehicles/UpdateVehicleDto";


@Controller('vehicles')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) {}

    @Post()
    create(@Body() dto: CreateVehicleDto) {
        return this.vehicleService.create(dto);
    }

    @Get()
    findAll(@Query('userId') userId?: string) {
        return this.vehicleService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.vehicleService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateVehicleDto,
    ) {
        return this.vehicleService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.vehicleService.remove(id);
    }
}