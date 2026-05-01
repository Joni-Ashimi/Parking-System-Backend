import {ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ParkingSpotStatus} from '../def/enums/ParkingSpotStatus';
import {ParkingSpot} from "../entity/ParkingSpot";
import {ParkingLot} from "../entity/ParkingLot";
import {CreateParkingSpotDto} from "../def/dto/parkingSpot/CreateParkingSpotDto";
import {UpdateParkingSpotDto} from "../def/dto/parkingSpot/UpdateParkingSpotDto";

@Injectable()
export class ParkingSpotService {
    constructor(
        @InjectRepository(ParkingSpot)
        private readonly parkingSpotRepository: Repository<ParkingSpot>,
        @InjectRepository(ParkingLot)
        private readonly parkingLotRepository: Repository<ParkingLot>,
    ) {
    }

    async create(dto: CreateParkingSpotDto): Promise<ParkingSpot> {
        const lot = await this.parkingLotRepository.findOne({
            where: {id: dto.lotId},
        });

        if (!lot) {
            throw new NotFoundException(`ParkingLot with id "${dto.lotId}" not found`);
        }

        const existing = await this.parkingSpotRepository.findOne({
            where: {spotNumber: dto.spotNumber, lot: {id: dto.lotId}},
        });

        if (existing) {
            throw new ConflictException(
                `Spot number "${dto.spotNumber}" already exists in this lot`,
            );
        }

        const spot = this.parkingSpotRepository.create({
            spotNumber: dto.spotNumber,
            floor: dto.floor,
            status: dto.status,
            lot,
        });

        return this.parkingSpotRepository.save(spot);
    }

    async findAll(lotId?: string): Promise<ParkingSpot[]> {
        const query = this.parkingSpotRepository
            .createQueryBuilder('spot')
            .leftJoinAndSelect('spot.lot', 'lot');

        if (lotId) {
            query.where('lot.id = :lotId', {lotId});
        }

        return query.getMany();
    }

    async findAllAvailable(lotId?: string): Promise<ParkingSpot[]> {
        const query = this.parkingSpotRepository
            .createQueryBuilder('spot')
            .leftJoinAndSelect('spot.lot', 'lot')
            .where('spot.status = :status', {status: ParkingSpotStatus.AVAILABLE});

        if (lotId) {
            query.andWhere('lot.id = :lotId', {lotId});
        }

        return query.getMany();
    }

    async findOne(id: string): Promise<ParkingSpot> {
        const spot = await this.parkingSpotRepository.findOne({
            where: {id},
            relations: ['lot'],
        });

        if (!spot) {
            throw new NotFoundException(`ParkingSpot with id "${id}" not found`);
        }

        return spot;
    }

    async update(id: string, dto: UpdateParkingSpotDto): Promise<ParkingSpot> {
        const spot = await this.findOne(id);

        if (dto.lotId && dto.lotId !== spot.lot?.id) {
            const lot = await this.parkingLotRepository.findOne({
                where: {id: dto.lotId},
            });

            if (!lot) {
                throw new NotFoundException(
                    `ParkingLot with id "${dto.lotId}" not found`,
                );
            }

            spot.lot = lot;
        }

        if (dto.spotNumber !== undefined) spot.spotNumber = dto.spotNumber;
        if (dto.floor !== undefined) spot.floor = dto.floor;
        if (dto.status !== undefined) spot.status = dto.status;

        return this.parkingSpotRepository.save(spot);
    }

    async updateStatus(id: string, status: ParkingSpotStatus): Promise<ParkingSpot> {
        const spot = await this.findOne(id);
        spot.status = status;
        return this.parkingSpotRepository.save(spot);
    }

    async remove(id: string): Promise<void> {
        const spot = await this.findOne(id);

        if (spot.status === ParkingSpotStatus.OCCUPIED) {
            throw new ConflictException(
                'Cannot delete an occupied parking spot',
            );
        }

        await this.parkingSpotRepository.remove(spot);
    }
}