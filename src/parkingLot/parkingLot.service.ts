import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ParkingLot} from "../entity/ParkingLot";
import {Repository} from "typeorm";
import {ParkingSpot} from "../entity/ParkingSpot";
import {CreateParkingLotDto} from "../def/dto/parkingLot/CreateParkingLot";
import {UpdateParkingLotDto} from "../def/dto/parkingLot/UpdateParkingLot";
import {ParkingSpotStatus} from "../def/enums/ParkingSpotStatus";

@Injectable()
export class ParkingLotService {
    constructor(
        @InjectRepository(ParkingLot)
        private lotRepo: Repository<ParkingLot>,
        @InjectRepository(ParkingSpot)
        private spotRepo: Repository<ParkingSpot>,
    ) {
    }

    async create(dto: CreateParkingLotDto) {
        const lot = this.lotRepo.create(dto);
        return this.lotRepo.save(lot);
    }

    async findAll() {
        return this.lotRepo.find({
            relations: ['spots'],
        });
    }

    async findOne(id: string) {
        const lot = await this.lotRepo.findOne({
            where: {id},
            relations: ['spots'],
        });

        if (!lot) throw new NotFoundException('Parking lot not found');
        return lot;
    }

    async update(id: string, dto: UpdateParkingLotDto) {
        const lot = await this.findOne(id);

        Object.assign(lot, dto);
        return this.lotRepo.save(lot);
    }

    async remove(id: string) {
        const lot = await this.findOne(id);
        return this.lotRepo.remove(lot);
    }

    async addSpotToLot(lotId: string, spotId: string) {
        const lot = await this.lotRepo.findOne({
            where: {id: lotId},
            relations: ['spots'],
        });

        if (!lot) throw new NotFoundException('Lot not found');

        const spot = await this.spotRepo.findOne({
            where: {id: spotId},
        });

        if (!spot) throw new NotFoundException('Spot not found');

        spot.lot = lot;

        await this.spotRepo.save(spot);

        return {message: 'Spot assigned to lot'};
    }

    async getLotStats(id: string) {
        const lot = await this.lotRepo.findOne({
            where: {id},
            relations: ['spots'],
        });

        if (!lot) throw new NotFoundException('Lot not found');

        const total = lot.spots.length;
        const occupied = lot.spots.filter(
            (s) => s.status === ParkingSpotStatus.OCCUPIED
        ).length;

        return {
            total,
            occupied,
            available: total - occupied,
        };
    }
}