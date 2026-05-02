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
  HttpStatus, UseGuards,
} from '@nestjs/common';
import { ParkingSpotStatus } from '../def/enums/ParkingSpotStatus';
import { IsEnum } from 'class-validator';
import {ParkingSpotService} from "./ParkingSpot.service";
import {CreateParkingSpotDto} from "../def/dto/parkingSpot/CreateParkingSpotDto";
import {UpdateParkingSpotDto} from "../def/dto/parkingSpot/UpdateParkingSpotDto";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";

class UpdateStatusDto {
  @IsEnum(ParkingSpotStatus)
  status: ParkingSpotStatus;
}

@Controller('parking-spots')
@UseGuards(JwtAuthGuard)
export class ParkingSpotController {
  constructor(private readonly parkingSpotService: ParkingSpotService) {}

  @Post()
  create(@Body() dto: CreateParkingSpotDto) {
    return this.parkingSpotService.create(dto);
  }

  @Get()
  findAll(@Query('lotId') lotId?: string) {
    return this.parkingSpotService.findAll(lotId);
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
  update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateParkingSpotDto,
  ) {
    return this.parkingSpotService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateStatusDto,
  ) {
    return this.parkingSpotService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingSpotService.remove(id);
  }
}