import {ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ParkingSpotStatus} from '../def/enums/ParkingSpotStatus';
import {ParkingSpot} from "../entity/ParkingSpot";
import {ParkingLot} from "../entity/ParkingLot";
import {CreateParkingSpotDto} from "../def/dto/parkingSpot/CreateParkingSpotDto";
import {UpdateParkingSpotDto} from "../def/dto/parkingSpot/UpdateParkingSpotDto";
import {SpotCategory} from "../entity/SpotCategory";
import {GetParkingSpotsQueryDto} from "../def/dto/parkingSpot/getParkingSpotQueryDto";

@Injectable()
export class ParkingSpotService {
    constructor(
        @InjectRepository(ParkingSpot)
        private readonly parkingSpotRepository: Repository<ParkingSpot>,
        @InjectRepository(ParkingLot)
        private readonly parkingLotRepository: Repository<ParkingLot>,
        @InjectRepository(SpotCategory)
        private readonly spotCategoryRepository: Repository<SpotCategory>,
    ) {
    }

    async create(dto: CreateParkingSpotDto): Promise<ParkingSpot> {
        const existingSpot = await this.parkingSpotRepository.findOne({
            where: { spotNumber: dto.spotNumber.trim() }
        });

        if (existingSpot) {
            throw new ConflictException(`Parking spot number "${dto.spotNumber}" already exists.`);
        };

        const lot = await this.parkingLotRepository.findOne({
            where: {id: dto.lotId},
        });

        if (!lot) {
            throw new NotFoundException(`ParkingLot with id "${dto.lotId}" not found`);
        }

        const spotCategory = await this.spotCategoryRepository.findOne({
            where: {id: dto.typeId},
        });

        if (!spotCategory) {
            throw new NotFoundException(`SpotCategory with id "${dto.typeId}" not found`);
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
            type: spotCategory,
        });

        return this.parkingSpotRepository.save(spot);
    }

    async findAll(queryDto: GetParkingSpotsQueryDto = {}) {
        const { lotId, page = 1, pageSize = 10, qs } = queryDto;
        const query = this.parkingSpotRepository
            .createQueryBuilder('spot')
            .leftJoinAndSelect('spot.lot', 'lot')
            .leftJoinAndSelect('spot.type', 'type');

        if (lotId) {
            query.where('lot.id = :lotId', {lotId});
        };

        if (qs) {
            query.andWhere('spot.spotNumber LIKE :qs', { qs: `%${qs}%` });
        }
        query.skip((page - 1) * pageSize).take(pageSize);
        query.orderBy('spot.floor', 'ASC')
            .addOrderBy('spot.spotNumber', 'ASC');

        const [data, total] = await query.getManyAndCount();
        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async getDashboardStats(lotId?: string) {
        const query = this.parkingSpotRepository
            .createQueryBuilder('spot')
            .select('spot.status', 'status')
            .addSelect('COUNT(spot.id)', 'count');

        const rawStats = await query.groupBy('spot.status').getRawMany();
        const metrics = {
            totalSpots: 0,
            availableSpots: 0,
            occupiedSpots: 0,
            maintenanceSpots: 0,
            reservedSpots: 0,
        };

        rawStats.forEach((row) => {
            const count = parseInt(row.count, 10);
            metrics.totalSpots += count;

            switch (row.status.toLowerCase()) {
                case 'available':
                    metrics.availableSpots = count;
                    break;
                case 'occupied':
                    metrics.occupiedSpots = count;
                    break;
                case 'maintenance':
                    metrics.maintenanceSpots = count;
                    break;
                case 'reserved':
                    metrics.reservedSpots = count;
                    break;
            }
        });

        return metrics;
    }

    async findAllAvailable(lotId?: string): Promise<ParkingSpot[]> {
        const query = this.parkingSpotRepository
            .createQueryBuilder('spot')
            .leftJoinAndSelect('spot.lot', 'lot')
            .leftJoinAndSelect('spot.type', 'type')
            .where('spot.status = :status', {status: ParkingSpotStatus.AVAILABLE});

        if (lotId) {
            query.andWhere('lot.id = :lotId', {lotId});
        }

        return query.getMany();
    }

    async findOne(id: string): Promise<ParkingSpot> {
        const spot = await this.parkingSpotRepository.findOne({
            where: {id},
            relations: ['lot', 'type'],
        });

        if (!spot) {
            throw new NotFoundException(`ParkingSpot with id "${id}" not found`);
        }

        return spot;
    }

    async update(id: string, dto: UpdateParkingSpotDto): Promise<ParkingSpot> {
        const spot = await this.findOne(id);

        if (dto.spotNumber !== undefined) {
            const trimmedNumber = dto.spotNumber.trim();

            const existingSpot = await this.parkingSpotRepository.findOne({
                where: { spotNumber: trimmedNumber }
            });

            if (existingSpot && existingSpot.id !== id) {
                throw new ConflictException(`Parking spot number "${dto.spotNumber}" already exists.`);
            }

            spot.spotNumber = trimmedNumber;
        }

        if (dto.lotId && dto.lotId !== spot.lot?.id) {
            const lot = await this.parkingLotRepository.findOne({
                where: { id: dto.lotId },
            });
            if (!lot) {
                throw new NotFoundException(`ParkingLot with id "${dto.lotId}" not found`);
            }
            spot.lot = lot;
        }

        if (dto.typeId && dto.typeId !== spot.type?.id) {
            const spotCategory = await this.spotCategoryRepository.findOne({
                where: { id: dto.typeId },
            });
            if (!spotCategory) {
                throw new NotFoundException(`SpotCategory with id "${dto.typeId}" not found`);
            }
            spot.type = spotCategory;
        }

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

        await this.parkingSpotRepository.softRemove(spot);
    }
}