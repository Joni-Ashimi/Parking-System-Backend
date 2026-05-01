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
    HttpStatus, UseGuards, UnauthorizedException,
} from '@nestjs/common';
import {VehicleService} from "./vehicles.service";
import {CreateVehicleDto} from "../def/dto/vehicles/CreateVehicleDto";
import {UpdateVehicleDto} from "../def/dto/vehicles/UpdateVehicleDto";
import {CurrentLoggedInUser} from "../decorator/current-user.decorator";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";


@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) {}

    @Get('my-vehicles')
    getMyVehicles(@CurrentLoggedInUser() user: { id: string }) {
        if (!user?.id) {
            throw new UnauthorizedException('User not found in request');
        }
        return this.vehicleService.findMyVehicles(user.id);
    }

    @Post()
    create(@Body() dto: CreateVehicleDto) {
        return this.vehicleService.create(dto);
    }

    @Patch(':id/default')
    setDefault(
        @Param('id') id: string,
        @CurrentLoggedInUser() user: { id: string }
    ) {
        return this.vehicleService.setDefaultVehicle(user.id, id);
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