import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ParkingSessionStatus} from '../def/enums/ParkingSessionStatus';
import {ParkingSession} from "../entity/ParkingSession";
import {User} from "../entity/User";
import {ParkingSpot} from "../entity/ParkingSpot";
import {ParkingSpotStatus} from "../def/enums/ParkingSpotStatus";

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(ParkingSession) private sessionRepo: Repository<ParkingSession>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(ParkingSpot) private spotRepo: Repository<ParkingSpot>,
    ) {
    }

    async getDashboardStats() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const totalUsers = await this.userRepo.count();

        const activeSessions = await this.sessionRepo.count({
            where: {status: ParkingSessionStatus.ACTIVE}
        });

        const totalSpots = await this.spotRepo.count();

        const availableSpots = await this.spotRepo.count({
            where: {status: ParkingSpotStatus.AVAILABLE}
        });

        const occupiedSpots = await this.spotRepo.count({
            where: {status: ParkingSpotStatus.OCCUPIED}
        });

        const revenue = await this.sessionRepo.createQueryBuilder('s')
            .select('SUM(s.price)', 'total')
            .where('s.status = :status', {status: ParkingSessionStatus.COMPLETED})
            .andWhere('s.exitTime BETWEEN :start AND :end', {start: startOfDay, end: endOfDay})
            .getRawOne();

        return {
            totalUsers,
            activeSessions,
            totalSpots,
            availableSpots,
            occupiedSpots,
            totalRevenue: parseFloat(revenue?.total ?? 0),
        };
    }

    async getRevenueData(type: 'daily' | 'hourly') {
        const query = this.sessionRepo.createQueryBuilder('s')
            .select('SUM(s.price)', 'revenue')
            .where('s.status = :status', {status: 'completed'});

        if (type === 'daily') {
            return await query
                .select("TO_CHAR(s.exitTime, 'Dy')", "day")
                .addSelect("SUM(s.price)", "revenue")
                .groupBy("day")
                .orderBy("MIN(s.exitTime)")
                .getRawMany();
        } else {
            return await query
                .select("TO_CHAR(s.exitTime, 'HH24:00')", "hour")
                .addSelect("SUM(s.price)", "revenue")
                .groupBy("hour")
                .orderBy("hour", "ASC")
                .getRawMany();
        }
    }

    async getPeakHours() {
        return await this.sessionRepo.createQueryBuilder('s')
            .select("TO_CHAR(s.entryTime, 'HH24:00')", "hour")
            .addSelect("COUNT(s.id) * 100.0 / (SELECT COUNT(*) FROM parking_spot)", "occupancy")
            .groupBy("hour")
            .orderBy("hour", "ASC")
            .getRawMany();
    }

    async getSpotUsage() {
        return await this.spotRepo.createQueryBuilder('spot')
            .leftJoin('spot.type', 'category')
            .select('category.name', 'name')
            .addSelect('COUNT(spot.id)', 'value')
            .groupBy('category.name')
            .getRawMany();
    }

    async getOccupancyTrend() {
        return await this.sessionRepo.createQueryBuilder('s')
            .select("TO_CHAR(DATE(s.entryTime), 'Mon DD')", "date")
            .addSelect(`
            ROUND(
                100.0 * COUNT(CASE WHEN s.status = 'active' THEN 1 END) 
                / NULLIF((SELECT COUNT(*) FROM parking_spot), 0),
                1
            )
        `, "rate")
            .where("s.entryTime >= CURRENT_DATE - INTERVAL '7 days'")
            .groupBy("DATE(s.entryTime)")
            .orderBy("DATE(s.entryTime)", "ASC")
            .getRawMany();
    }
}