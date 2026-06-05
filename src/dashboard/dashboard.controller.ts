import {Controller, Get, Query} from '@nestjs/common';
import {DashboardService} from './dashboard.service';

@Controller('admin/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {
    }

    @Get('stats')
    async getStats() {
        return await this.dashboardService.getDashboardStats();
    }

    @Get('revenue')
    async getRevenue(@Query('view') view: 'daily' | 'hourly') {
        return await this.dashboardService.getRevenueData(view);
    }

    @Get('peak-hours')
    async getPeakHours() {
        return await this.dashboardService.getPeakHours();
    }

    @Get('spot-usage')
    async getSpotUsage() {
        return await this.dashboardService.getSpotUsage();
    }

    @Get('occupancy-trend')
    async getOccupancyTrend() { return await this.dashboardService.getOccupancyTrend(); }
}