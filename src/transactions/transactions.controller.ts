import {Body, Controller, Delete, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {Request} from 'express';
import {TransactionsService} from './transactions.service';
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {
    }

    @Post('initiate')
    async initiateCheckout(@Body() body: { amount: number; sessionId: string; currency: 'ALL' | 'EUR' }) {
        const transaction = await this.transactionsService.createParkingTransaction(body);
        return {sdkOrderId: transaction.sdkOrderId};
    }

    @Post('prepare-3ds')
    async prepare3DS(
        @Body() body: { sdkOrderId: string; cardId: string },
        @Req() req: Request & { user: { id: string } }
    ) {
        return await this.transactionsService.prepare3DS(body.sdkOrderId, body.cardId, req.user.id);
    }

    @Post('finalize')
    async finalizeTransaction(@Body() body: { sdkOrderId: string }) {
        return this.transactionsService.finalizeParkingTransaction(body.sdkOrderId);
    }

    // Matches frontend createTransaction
    @Post()
    createTransaction(@Body() payload: { amount: number; sessionId: string; currency: 'ALL' | 'EUR' }) {
        return this.transactionsService.createParkingTransaction(payload);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionsService.findOne(id);
    }

    @Get('session/:sessionId')
    getTransactionForParkingSession(@Param('sessionId') sessionId: string) {
        return this.transactionsService.getTransactionForParkingSession(sessionId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.transactionsService.delete(id);
    }
}