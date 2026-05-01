import {Body, Controller, Delete, Get, Param, Patch, Post} from "@nestjs/common";
import {ParkingLotService} from "./parkingLot.service";
import {CreateParkingLotDto} from "../def/dto/parkingLot/CreateParkingLot";
import {UpdateParkingLotDto} from "../def/dto/parkingLot/UpdateParkingLot";

@Controller('parking-lots')
export class ParkingLotController {
    constructor(private readonly service: ParkingLotService) {}

    @Post()
    create(@Body() dto: CreateParkingLotDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateParkingLotDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Post(':id/spots/:spotId')
    assignSpot(
        @Param('id') lotId: string,
        @Param('spotId') spotId: string,
    ) {
        return this.service.addSpotToLot(lotId, spotId);
    }

    @Get(':id/stats')
    stats(@Param('id') id: string) {
        return this.service.getLotStats(id);
    }
}