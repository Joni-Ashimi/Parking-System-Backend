import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {ParkingSession} from '../entity/ParkingSession';
import {ParkingSpot} from '../entity/ParkingSpot';
import {Vehicle} from '../entity/Vehicle';
import {Transaction} from '../entity/Transaction';
import {TransactionsService} from '../transactions/transactions.service';
import {ParkingSessionStatus} from '../def/enums/ParkingSessionStatus';
import {VehicleType} from '../def/enums/VehicleType';
import {ParkingSpotStatus} from "../def/enums/ParkingSpotStatus";
import {ActiveSessionsParams} from "../def/dto/ActiveSessionParams.dto";
import {User} from "../entity/User";
import {UserVerificationStatus} from "../def/enums/UserVerificationStatus";

@Injectable()
export class ParkingSessionService {
    constructor(
        @InjectRepository(ParkingSession) private sessionRepo: Repository<ParkingSession>,
        @InjectRepository(ParkingSpot) private spotRepo: Repository<ParkingSpot>,
        @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly transactionsService: TransactionsService,
        private readonly dataSource: DataSource,
    ) {
    }

    private isVehicleCompatible(vehicleType: VehicleType, spotSize: string): boolean {
        const map: Record<string, VehicleType[]> = {
            small: [VehicleType.MOTORCYCLE],
            standard: [VehicleType.CAR],
            large: [VehicleType.TRUCK, VehicleType.BUS],
        };
        return map[spotSize.toLowerCase()]?.includes(vehicleType) ?? false;
    }

    private calculatePrice(spot: ParkingSpot, entryTime: Date, exitTime: Date): number {
        const durationHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
        const now = new Date();
        const activeRule = spot.type?.rules?.find(rule => {
            const matchesDay = rule.dayOfWeek === null || rule.dayOfWeek === now.getDay();
            const matchesHour = rule.startHour === null ||
                (now.getHours() >= rule.startHour && now.getHours() < rule.endHour);
            return matchesDay && matchesHour;
        });
        const base = Number(spot.type.baseHourlyRate);
        const rate = activeRule
            ? (activeRule.adjustmentType === 'DISCOUNT'
                ? base * (1 - Number(activeRule.value) / 100)
                : base * (1 + Number(activeRule.value) / 100))
            : base;
        return Number((durationHours * rate).toFixed(2));
    }

    async reserveSpot(spotId: string, cardId: string, userId: string) {
        const spot = await this.spotRepo.findOne({
            where: {id: spotId},
            relations: ['type'],
        });
        if (!spot) throw new NotFoundException('Spot not found');

        const vehicle = await this.vehicleRepo.findOne({
            where: {user: {id: userId}, isDefault: true},
        });
        if (!vehicle) throw new NotFoundException(
            'No default vehicle found. Please add a vehicle first.'
        );

        if (!this.isVehicleCompatible(vehicle.type, spot.type.size)) {
            throw new BadRequestException(
                `Your vehicle type (${vehicle.type}) is not compatible with this spot size (${spot.type.size}).`
            );
        }

        const user = await this.userRepo.findOne({where: {id: userId}});
        if (!user) throw new NotFoundException('User not found')

        if (user.verificationStatus != UserVerificationStatus.VERIFIED && user.bannedUntil && user.bannedUntil > new Date()) {
            const now = new Date();
            const msRemaining = user.bannedUntil.getTime() - now.getTime();
            const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            throw new ForbiddenException(
                `Your account is banned. You cannot reserve a parking spot for another ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`
            );
        }

        const activeSession = await this.sessionRepo.findOne({
            where: {user: {id: userId}, status: ParkingSessionStatus.ACTIVE},
        });
        if (activeSession) {
            throw new BadRequestException('You already have an active parking session. Please end it before reserving a new spot.');
        }

        await this.spotRepo.update(spotId, {status: ParkingSpotStatus.OCCUPIED, updatedAt: new Date()});
        const session = this.sessionRepo.create({
            spot: {id: spotId},
            user: {id: userId},
            vehicle: {id: vehicle.id},
            status: ParkingSessionStatus.ACTIVE,
            entryTime: new Date(),
        });
        return this.sessionRepo.save(session);
    }

    async endSession(sessionId: string): Promise<Transaction> {
        return this.dataSource.transaction(async (manager) => {
            const session = await this.sessionRepo
                .createQueryBuilder('session')
                .leftJoinAndSelect('session.spot', 'spot')
                .leftJoinAndSelect('spot.type', 'type')
                .leftJoinAndSelect('type.rules', 'rules')
                .where('session.id = :sessionId', {sessionId})
                .getOne();

            if (!session) throw new NotFoundException('Session not found');

            session.exitTime = new Date();
            session.price = this.calculatePrice(session.spot, session.entryTime, session.exitTime);

            const pokTransaction = await this.transactionsService.createParkingTransaction({
                amount: session.price,
                sessionId: session.id,
                currency: 'EUR',
            });

            return this.dataSource.transaction(async (manager) => {
                session.status = ParkingSessionStatus.COMPLETED;
                await manager.save(session);

                await manager.update(ParkingSpot, session.spot.id, {
                    status: ParkingSpotStatus.AVAILABLE,
                });

                return pokTransaction;
            });
        })
    }

    async getActiveSession(userId: string) {
        const session = await this.sessionRepo
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.spot', 'spot')
            .leftJoinAndSelect('spot.type', 'type')
            .leftJoinAndSelect('type.rules', 'rules')
            .leftJoinAndSelect('spot.lot', 'lot')
            .leftJoinAndSelect('session.vehicle', 'vehicle')
            .where('session.user = :userId', {userId})
            .andWhere('session.status = :status', {status: ParkingSessionStatus.ACTIVE})
            .getOne();

        if (!session) return null;

        const type = session.spot?.type;
        let effectiveHourlyRate = Number(type?.baseHourlyRate ?? 0);
        let activeRuleName: string | null = null;

        if (type?.rules?.length) {
            const now = new Date();
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
            ...session,
            spot: {
                ...session.spot,
                type: type ? {
                    ...type,
                    effectiveHourlyRate,
                    isDiscounted: effectiveHourlyRate < Number(type.baseHourlyRate),
                    activeRuleName,
                } : null,
            },
        };
    }

    async getUserSessionHistory(userId: string) {
        const sessions = await this.sessionRepo
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.spot', 'spot')
            .leftJoinAndSelect('spot.type', 'type')
            .leftJoinAndSelect('spot.lot', 'lot')
            .leftJoinAndSelect('session.vehicle', 'vehicle')
            .leftJoinAndSelect('session.transaction', 'transaction')
            .where('session.user = :userId', {userId})
            .andWhere('session.status != :status', {status: ParkingSessionStatus.ACTIVE})
            .orderBy('session.createdAt', 'DESC')
            .getMany();
        return sessions;
    }

    async getAllActiveSessions({
                                   page,
                                   pageSize,
                                   qs = "",
                                   sortBy,
                                   sortOrder = "DESC",
                               }: ActiveSessionsParams) {
        const query = this.sessionRepo
            .createQueryBuilder("session")
            .leftJoin("session.user", "user")
            .leftJoin("session.vehicle", "vehicle")
            .leftJoin("session.spot", "spot")
            .select([
                "session.id", "session.entryTime", "session.status", "session.price",
                "user.name", "vehicle.plateNumber", "spot.spotNumber"
            ])
            .where("session.status = :status", {status: ParkingSessionStatus.ACTIVE})

        if (qs) {
            query.andWhere(
                `(LOWER(user.name) LIKE LOWER(:qs) OR LOWER(vehicle.plateNumber) LIKE LOWER(:qs) OR LOWER(spot.spotNumber) LIKE LOWER(:qs))`,
                {qs: `%${qs}%`}
            );
        }

        const allowedSorts: Record<string, string> = {
            userName: "user.name",
            spotNumber: "spot.spotNumber",
            entryTime: "session.entryTime",
        };

        const sortField = (sortBy && allowedSorts[sortBy]) ? allowedSorts[sortBy] : "session.entryTime";
        const direction = (sortOrder === "ASC") ? "ASC" : "DESC";

        query.orderBy(sortField, direction);

        query.skip((page - 1) * pageSize);
        query.take(pageSize);

        const [data, total] = await query.getManyAndCount();
        return {data, total};
    }

    async getAdminRevenueFromSessions(date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return await this.sessionRepo
            .createQueryBuilder('session')
            .innerJoin('session.transaction', 'transaction')
            .select('SUM(transaction.finalAmount)', 'totalRevenue')
            .where('session.status = :status', {status: 'completed'})
            .andWhere('session.createdAt BETWEEN :start AND :end', {
                start: startOfDay,
                end: endOfDay,
            })
            .getRawOne();
    }

    async getPricingMetrics() {
        const avgRateResult = await this.spotRepo
            .createQueryBuilder('spot')
            .leftJoin('spot.type', 'type')
            .select('AVG(type.baseHourlyRate)', 'avgRate')
            .getRawOne();

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const revenueResult = await this.sessionRepo
            .createQueryBuilder('session')
            .select('SUM(session.price)', 'total') // 'price' is the column in your entity
            .where('session.entryTime >= :startOfDay', {startOfDay})
            .andWhere('session.status = :status', {status: ParkingSessionStatus.COMPLETED})
            .getRawOne();

        const totalSpots = await this.spotRepo.count();
        const occupiedSpots = await this.spotRepo.count({
            where: {status: ParkingSpotStatus.OCCUPIED}
        });

        return {
            avgHourlyRate: parseFloat(avgRateResult?.avgRate || 0),
            dailyRevenue: parseFloat(revenueResult?.total || 0),
            occupancyRate: totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0
        };
    }
}