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
import { ParkingSpotStatus } from '../def/enums/ParkingSpotStatus';
import { IsEnum } from 'class-validator';
import {ParkingSpotService} from "./ParkingSpot.service";
import {CreateParkingSpotDto} from "../def/dto/create-parking-spot.dto";
import {UpdateParkingSpotDto} from "../def/dto/update-parking-spot.dto";

class UpdateStatusDto {
  @IsEnum(ParkingSpotStatus)
  status: ParkingSpotStatus;
}

@Controller('parking-spots')
export class ParkingSpotController {
  constructor(private readonly parkingSpotService: ParkingSpotService) {}

  // POST /parking-spots
  @Post()
  create(@Body() dto: CreateParkingSpotDto) {
    return this.parkingSpotService.create(dto);
  }

  // GET /parking-spots?lotId=xxx
  @Get()
  findAll(@Query('lotId') lotId?: string) {
    return this.parkingSpotService.findAll(lotId);
  }

  // GET /parking-spots/available?lotId=xxx
  @Get('available')
  findAllAvailable(@Query('lotId') lotId?: string) {
    return this.parkingSpotService.findAllAvailable(lotId);
  }

  // GET /parking-spots/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingSpotService.findOne(id);
  }

  // PATCH /parking-spots/:id
  @Patch(':id')
  update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateParkingSpotDto,
  ) {
    return this.parkingSpotService.update(id, dto);
  }

  // PATCH /parking-spots/:id/status
  @Patch(':id/status')
  updateStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() dto: UpdateStatusDto,
  ) {
    return this.parkingSpotService.updateStatus(id, dto.status);
  }

  // DELETE /parking-spots/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingSpotService.remove(id);
  }
}