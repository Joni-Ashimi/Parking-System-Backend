import {BadRequestException, ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Like, Repository} from 'typeorm';
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
        private dataSource: DataSource,
    ) {
    }

    async create(dto: CreateParkingSpotDto): Promise<ParkingSpot> {
        const cleanSpotNumber = dto.spotNumber.trim();

        const parts = cleanSpotNumber.split('-');
        const targetRow = parts[0].trim().toUpperCase();

        if (!targetRow || parts.length < 2) {
            throw new BadRequestException('Invalid spot number formatting sequence. Expected format like "A-01".');
        }

        const existingRowSpotsCount = await this.parkingSpotRepository.count({
            where: {
                spotNumber: Like(`${targetRow}-%`),
                lot: {id: dto.lotId}
            },
        });

        const MAX_ROW_COLUMNS = 10;
        if (existingRowSpotsCount >= MAX_ROW_COLUMNS) {
            const nextSuggestedRow = String.fromCharCode(targetRow.charCodeAt(0) + 1);
            throw new BadRequestException(
                `Row group "${targetRow}" is full. Please shift allocation to row "${nextSuggestedRow}".`,
            );
        }

        const duplicateSpot = await this.parkingSpotRepository.findOne({
            where: {
                spotNumber: cleanSpotNumber,
                lot: {id: dto.lotId}
            },
        });

        if (duplicateSpot) {
            throw new ConflictException(
                `Spot number "${cleanSpotNumber}" already exists in this parking lot.`,
            );
        }

        const [lot, spotCategory] = await Promise.all([
            this.parkingLotRepository.findOne({where: {id: dto.lotId}}),
            this.spotCategoryRepository.findOne({where: {id: dto.typeId}}),
        ]);

        if (!lot) {
            throw new NotFoundException(`ParkingLot with id "${dto.lotId}" not found.`);
        }

        if (!spotCategory) {
            throw new NotFoundException(`SpotCategory with id "${dto.typeId}" not found.`);
        }

        // 5. Instantiate and persist the TypeORM entity
        const spot = this.parkingSpotRepository.create({
            spotNumber: cleanSpotNumber,
            floor: dto.floor,
            status: dto.status,
            lot,
            type: spotCategory,
        });

        return await this.parkingSpotRepository.save(spot);
    }

    async findAll(queryDto: GetParkingSpotsQueryDto = {}) {
        const {lotId, page = 1, pageSize = 8, qs} = queryDto;

        const query = this.parkingSpotRepository
            .createQueryBuilder('spot')
            .leftJoinAndSelect('spot.lot', 'lot')
            .leftJoinAndSelect('spot.type', 'type')
            .leftJoinAndSelect('type.rules', 'rules');

        if (lotId) {
            query.where('lot.id = :lotId', {lotId});
        }

        if (qs) {
            query.andWhere('spot.spotNumber LIKE :qs', {qs: `%${qs}%`});
        }

        query.skip((page - 1) * pageSize).take(pageSize);
        query.orderBy('spot.floor', 'ASC')
            .addOrderBy('spot.spotNumber', 'ASC');

        const [data, total] = await query.getManyAndCount();

        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();

        const processedData = data.map((spot) => {
            if (!spot.type) return spot;

            const baseHourly = Number(spot.type.baseHourlyRate);
            const baseDaily = Number(spot.type.baseDailyRate);

            const activeRule = spot.type.rules?.find((rule) => {
                const ruleDay = rule.dayOfWeek !== null ? Number(rule.dayOfWeek) : null;
                const ruleStart = rule.startHour !== null ? Number(rule.startHour) : null;
                const ruleEnd = rule.endHour !== null ? Number(rule.endHour) : null;

                const matchesDay = ruleDay === null || ruleDay === currentDay;

                const matchesHour =
                    ruleStart === null || ruleEnd === null ||
                    (currentHour >= ruleStart && currentHour < ruleEnd);

                return matchesDay && matchesHour;
            });

            let effectiveHourlyRate = baseHourly;
            if (activeRule) {
                const ruleValue = Number(activeRule.value);
                effectiveHourlyRate = activeRule.adjustmentType === 'DISCOUNT'
                    ? baseHourly * (1 - ruleValue / 100)
                    : baseHourly * (1 + ruleValue / 100);
            }

            return {
                ...spot,
                type: {
                    ...spot.type,
                    baseHourlyRate: baseHourly,
                    baseDailyRate: baseDaily,
                    effectiveHourlyRate: Number(Math.max(0, effectiveHourlyRate).toFixed(2)),
                    isDiscounted: effectiveHourlyRate < baseHourly,
                    activeRuleName: activeRule ? activeRule.name : null,
                }
            };
        });

        return {
            data: processedData,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async findAllForMap() {
        const spots = await this.dataSource.getRepository(ParkingSpot).find({
            relations: ['type', 'type.rules', 'lot'],
            order: {floor: 'ASC', spotNumber: 'ASC'},
        });

        const now = new Date();

        return spots.map(spot => {
            const type = spot.type;
            let effectiveHourlyRate = Number(type?.baseHourlyRate ?? 0);
            let activeRuleName: string | null = null;

            if (type?.rules?.length) {
                const activeRule = type.rules.find(rule => {
                    const matchesDay = rule.dayOfWeek === null || rule.dayOfWeek === now.getDay();
                    const matchesHour = rule.startHour === null ||
                        (now.getHours() >= rule.startHour && now.getHours() < rule.endHour);
                    return matchesDay && matchesHour;
                });
                if (activeRule) {
                    const val = Number(activeRule.value);
                    effectiveHourlyRate = Number((activeRule.adjustmentType === 'DISCOUNT'
                        ? effectiveHourlyRate * (1 - val / 100)
                        : effectiveHourlyRate * (1 + val / 100)).toFixed(2));
                    activeRuleName = activeRule.name;
                }
            }

            return {
                id: spot.id,
                spotNumber: spot.spotNumber,
                floor: spot.floor,
                status: spot.status,
                type: type ? {
                    id: type.id,
                    name: type.name,
                    size: type.size,
                    baseHourlyRate: Number(type.baseHourlyRate),
                    effectiveHourlyRate,
                    isDiscounted: effectiveHourlyRate < Number(type.baseHourlyRate),
                    activeRuleName,
                } : null,
                lot: spot.lot ? {id: spot.lot.id, name: spot.lot.name} : null,
            };
        });
    }

    private computeEffectiveRate(type: SpotCategory): number {
        const now = new Date();
        const activeRule = type.rules?.find(rule => {
            const matchesDay = rule.dayOfWeek === null || rule.dayOfWeek === now.getDay();
            const matchesHour = rule.startHour === null ||
                (now.getHours() >= rule.startHour && now.getHours() < rule.endHour);
            return matchesDay && matchesHour;
        });
        const base = Number(type.baseHourlyRate);
        if (!activeRule) return base;
        const val = Number(activeRule.value);
        return Number((activeRule.adjustmentType === 'DISCOUNT'
            ? base * (1 - val / 100)
            : base * (1 + val / 100)).toFixed(2));
    }

    private getActiveRuleName(type: SpotCategory): string | null {
        const now = new Date();
        const rule = type.rules?.find(rule => {
            const matchesDay = rule.dayOfWeek === null || rule.dayOfWeek === now.getDay();
            const matchesHour = rule.startHour === null ||
                (now.getHours() >= rule.startHour && now.getHours() < rule.endHour);
            return matchesDay && matchesHour;
        });
        return rule?.name ?? null;
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
                where: {spotNumber: trimmedNumber}
            });

            if (existingSpot && existingSpot.id !== id) {
                throw new ConflictException(`Parking spot number "${dto.spotNumber}" already exists.`);
            }

            spot.spotNumber = trimmedNumber;
        }

        if (dto.lotId && dto.lotId !== spot.lot?.id) {
            const lot = await this.parkingLotRepository.findOne({
                where: {id: dto.lotId},
            });
            if (!lot) {
                throw new NotFoundException(`ParkingLot with id "${dto.lotId}" not found`);
            }
            spot.lot = lot;
        }

        if (dto.typeId && dto.typeId !== spot.type?.id) {
            const spotCategory = await this.spotCategoryRepository.findOne({
                where: {id: dto.typeId},
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