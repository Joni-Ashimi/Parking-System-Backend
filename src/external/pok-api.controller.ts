import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { PokApiService } from './pok-api.service';
import { CreateTransactionDto } from './types/create-transaction.dto';
import { RetrieveOrderResponse } from './interfaces/retrieve-order.interface';
import { CancellationDto } from './types/cancellation.dto';
import { RefundDto } from './types/refund.dto';
import { CaptureDto } from './types/capture.dto';

@Controller('pok')
export class PokApiController {
    constructor(private readonly pokApiService: PokApiService) {}

    // Endpoints until now:
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
        return this.pokApiService.createTransaction(createTransactionDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async retrieveTransaction(
        @Query('sdkOrderId') sdkOrderId: string,
    ): Promise<RetrieveOrderResponse> {
        return this.pokApiService.getTransactionById(sdkOrderId);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() payload: any) {
        return this.pokApiService.handleTransactionWebhook(payload);
    }

    // {{baseUrl}}/merchants/:merchantId/sdk-orders/:sdkOrderId/cancel
    @Post('merchants/:merchantId/sdk-orders/:sdkOrderId/cancel')
    @HttpCode(HttpStatus.OK)
    async cancelTransaction(
        @Param('merchantId') merchantId: string,
        @Param('sdkOrderId') sdkOrderId: string,
        @Body() body: CancellationDto,
    ) {
        return this.pokApiService.cancelTransaction(
            merchantId,
            sdkOrderId,
            body.cancellationReason,
        );
    }

    // {{baseUrl}}/merchants/:merchantId/sdk-orders/:sdkOrderId/refund
    @Post('merchants/:merchantId/sdk-orders/:sdkOrderId/refund')
    @HttpCode(HttpStatus.OK)
    async refundTransaction(
        @Param('merchantId') merchantId: string,
        @Param('sdkOrderId') sdkOrderId: string,
        @Body() body: RefundDto,
    ) {
        return this.pokApiService.refund(
            merchantId,
            sdkOrderId,
            body.refundReason,
            body.refundAmount,
        );
    }

    // {{baseUrl}}/merchants/:merchantId/sdk-orders/:sdkOrderId/capture
    @Post('merchants/:merchantId/sdk-orders/:sdkOrderId/capture')
    @HttpCode(HttpStatus.OK)
    async captureTransaction(
        @Param('merchantId') merchantId: string,
        @Param('sdkOrderId') sdkOrderId: string,
        @Body() body: CaptureDto,
    ) {
        return this.pokApiService.capture(merchantId, sdkOrderId, body);
    }

    // `{{baseUrl}}/credit-debit-cards/${creditDebitCardId}/setup-tokenized-3ds`
    @Post('credit-debit-card/:creditDebitCardId/setup-tokenized-3ds')
    @HttpCode(HttpStatus.OK)
    async setupTokenized3DS(
        @Param('cardId') creditDebitCardId: string,
        @Body() body: { sdkOrderId: string },
    ) {
        return this.pokApiService.setupTokenized3DS(
            creditDebitCardId,
            body.sdkOrderId,
        );
    }
}