import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {ParkingSpotStatus} from '../def/enums/ParkingSpotStatus';
import {IsEnum} from 'class-validator';
import {ParkingSpotService} from "./ParkingSpot.service";
import {CreateParkingSpotDto} from "../def/dto/parkingSpot/CreateParkingSpotDto";
import {UpdateParkingSpotDto} from "../def/dto/parkingSpot/UpdateParkingSpotDto";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {GetParkingSpotsQueryDto} from "../def/dto/parkingSpot/getParkingSpotQueryDto";
import {RolesGuard} from "../decorator/roles.guard";
import {Roles} from "../decorator/roles.decorator";
import {UserType} from "../def/enums/UserType";

class UpdateStatusDto {
    @IsEnum(ParkingSpotStatus)
    status: ParkingSpotStatus;
}

@Controller('parking-spots')
@UseGuards(JwtAuthGuard)
export class ParkingSpotController {
    constructor(private readonly parkingSpotService: ParkingSpotService) {
    }

    @Get('map-layout')
    async getMapLayout() {
        return this.parkingSpotService.findAllForMap();
    }

    @Post()
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    create(@Body() dto: CreateParkingSpotDto) {
        return this.parkingSpotService.create(dto);
    }

    @Get()
    findAll(@Query() query: GetParkingSpotsQueryDto) {
        return this.parkingSpotService.findAll(query);
    }

    @Get('stats')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    getDashboardStats(@Query('lotId') lotId?: string) {
        return this.parkingSpotService.getDashboardStats(lotId);
    }

    @Get('available')
    findAllAvailable(@Query('lotId') lotId?: string) {
        return this.parkingSpotService.findAllAvailable(lotId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.parkingSpotService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateParkingSpotDto,
    ) {
        return this.parkingSpotService.update(id, dto);
    }

    @Patch(':id/status')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateStatusDto,
    ) {
        return this.parkingSpotService.updateStatus(id, dto.status);
    }

    @Delete(':id')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.parkingSpotService.remove(id);
    }
}