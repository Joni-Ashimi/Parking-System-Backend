import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ParkingSessionStatus} from '../def/enums/ParkingSessionStatus';
import {ParkingSession} from "../entity/ParkingSession";
import {User} from "../entity/User";
import {ParkingSpot} from "../entity/ParkingSpot";

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
        const activeSessions = await this.sessionRepo.count({where: {status: ParkingSessionStatus.ACTIVE}});
        const totalSpots = await this.spotRepo.count();
        const revenue = await this.sessionRepo.createQueryBuilder('s')
            .select('SUM(s.price)', 'total')
            .where('s.status = :status', { status: 'completed' })
            .andWhere('s.entryTime BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
            .getRawOne();

        return {
            totalUsers,
            activeSessions,
            activeSpots: activeSessions,
            totalSpots,
            totalRevenue: parseFloat(revenue.total || 0),
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
            .select("TO_CHAR(s.entryTime, 'Mon DD')", "date")
            .addSelect("AVG(100.0 * (SELECT COUNT(*) FROM parking_session WHERE status = 'active') / (SELECT COUNT(*) FROM parking_spot))", "rate")
            .where("s.entryTime >= CURRENT_DATE - INTERVAL '7 days'")
            .groupBy("date")
            .orderBy("MIN(s.entryTime)", "ASC")
            .getRawMany();
    }
}