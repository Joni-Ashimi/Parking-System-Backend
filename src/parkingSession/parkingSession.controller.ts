import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guard/jwt-auth.guard';
import {ParkingSessionService} from "./parkingSession.service";
import {CurrentLoggedInUser} from "../decorator/current-user.decorator";
import {BannedUserGuard} from "../decorator/banned-user.decorator";

@Controller('parking-sessions')
@UseGuards(JwtAuthGuard)
export class ParkingSessionController {
    constructor(private readonly parkingSessionService: ParkingSessionService) {
    }

    @Get("all/active")
    async getActiveSessions(
        @Query("page") page = 1,
        @Query("pageSize") pageSize = 10,
        @Query("qs") qs = "",
        @Query("sortBy") sortBy?: string,
        @Query("sortOrder") sortOrder?: "ASC" | "DESC",
    ) {
        return await this.parkingSessionService.getAllActiveSessions({
            page: Number(page),
            pageSize: Number(pageSize),
            qs,
            sortBy,
            sortOrder,
        });
    }

    @Get('revenue/daily')
    async getDailyRevenue(@Query('date') dateString?: string) {
        const date = dateString ? new Date(dateString) : new Date();
        const result = await this.parkingSessionService.getAdminRevenueFromSessions(date);

        return {
            date: date.toISOString().split('T')[0],
            totalRevenue: parseFloat(result.totalRevenue) || 0,
        };
    }

    @Post('reserve')
    @UseGuards(JwtAuthGuard, BannedUserGuard)
    async reserve(@Body() body: { spotId: string, cardId: string }, @CurrentLoggedInUser('id') userId: string) {
        return await this.parkingSessionService.reserveSpot(body.spotId, body.cardId, userId);
    }

    @Get('active')
    @UseGuards(JwtAuthGuard)
    getActiveSession(@CurrentLoggedInUser('id') userId: string) {
        return this.parkingSessionService.getActiveSession(userId);
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    getUserSessionHistory(@CurrentLoggedInUser('id') userId: string) {
        return this.parkingSessionService.getUserSessionHistory(userId);
    }

    @Get('price-metrics')
    getPricingMetrics() {
        return this.parkingSessionService.getPricingMetrics();
    }

    @Post(':id/end')
    @UseGuards(JwtAuthGuard, BannedUserGuard)
    async endSession(
        @Param('id') sessionId: string,
        @CurrentLoggedInUser('id') userId: string,
    ) {
        return this.parkingSessionService.endSession(sessionId);
    }


}