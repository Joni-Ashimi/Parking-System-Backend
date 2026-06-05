import {
    Body,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from './interfaces/auth-response.interface';
import { CreateTransactionDto } from './types/create-transaction.dto';
import { TransactionResponse } from './interfaces/create-transaction-response.interface';
import { RetrieveOrderResponse } from './interfaces/retrieve-order.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaptureDto } from './types/capture.dto';
import {TransactionStatus} from "../def/enums/TransactionStatus";
import {Transaction} from "../entity/Transaction";
import {TokenizeCardDto} from "../def/enums/cards/createCard.type";
import {Check3dsEnrollmentType} from "../def/enums/cards/check3dsEntrollment.type";

@Injectable()
export class PokApiService {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiry: Date | null = null;
    private readonly keyId: string | null = null;
    private readonly keySecret: string | null = null;
    private readonly baseUrl: string | null = null;
    private readonly merchantId: string | null = null;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,

        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {
        this.baseUrl = this.configService.get<string>('POK_STAGE_BASE_URL') ?? '';
        this.keyId = this.configService.get<string>('POK_KEY_ID') ?? '';
        this.keySecret = this.configService.get<string>('POK_KEY_SECRET') ?? '';
        this.merchantId = this.configService.get<string>('POK_MERCHANT_ID') ?? '';
    }

    private async authenticate(): Promise<void> {
        try {
            const keyId = this.keyId;
            const keySecret = this.keySecret;

            const payload = { keyId, keySecret };
            const loginUrl = `${this.baseUrl}/auth/sdk/login`;
            const res = await this.httpService.axiosRef.post<AuthResponse>(
                loginUrl,
                payload,
                { headers: { 'Content-Type': 'application/json' } },
            );
            const tokenData = res.data.data;
            this.accessToken = tokenData.accessToken;
            this.refreshToken = tokenData.refreshToken;

            const expiresInMs = parseInt(tokenData.expiresIn, 10);
            this.tokenExpiry = new Date(Date.now() + expiresInMs - 60000);
        } catch (err) {
            throw new Error(`Failed to authenticate with POK API: ${err.message}`);
        }
    }

    private async refreshTokens(): Promise<void> {
        try {
            const payload = {
                refreshToken: this.refreshToken,
            };
            const refreshUrl = `${this.baseUrl}/auth/sdk/refresh`;
            const res = await this.httpService.axiosRef.post<AuthResponse>(
                refreshUrl,
                payload,
            );
            const { accessToken, refreshToken, expiresIn } = res.data.data;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            const expiresInMs = parseInt(expiresIn, 10);
            this.tokenExpiry = new Date(Date.now() + expiresInMs - 60000);
        } catch (err) {
            this.refreshToken = null;
            await this.authenticate();
        }
    }

    public async ensureValidToken(): Promise<void> {
        const now = new Date();
        if (!this.accessToken) {
            await this.authenticate();
        } else if (this.tokenExpiry && this.tokenExpiry < now) {
            await this.refreshTokens();
        }
    }

    public async createTransaction(
        payload: CreateTransactionDto,
    ): Promise<TransactionResponse> {
        try {
            await this.ensureValidToken();
            const createTransactionUrl = `${this.baseUrl}/merchants/${this.merchantId}/sdk-orders`;
            const res = await this.httpService.axiosRef.post(
                createTransactionUrl,
                payload,
                {
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                },
            );
            return res.data;
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Unknown error';
            throw new InternalServerErrorException(
                `Failed to create transaction: ${message}`,
            );
        }
    }

    public async getTransactionById(id: string): Promise<RetrieveOrderResponse> {
        try {
            await this.ensureValidToken();
            const url = `${this.baseUrl}/merchants/${this.merchantId}/sdk-orders/${id}`;

            const { data } =
                await this.httpService.axiosRef.get<RetrieveOrderResponse>(url, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

            return data;
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || 'Unknown error';
            throw new InternalServerErrorException(
                `Failed to retrieve transaction: ${message}`,
            );
        }
    }

    async handleTransactionWebhook(@Body() payload: any) {
        try {
            const sdkOrderId = payload?.data?.sdkOrder?.id;
            const status = payload?.data?.sdkOrder?.status;

            if (!sdkOrderId || !status) {
                return { success: false, message: 'Missing sdkOrderId or status' };
            }

            const transaction = await this.transactionRepository.findOne({
                where: { sdkOrderId },
                relations: ['parkingSession'],
            });

            if (!transaction) {
                throw new NotFoundException(`Transaction ${sdkOrderId} not found`);
            }

            transaction.status =
                status === TransactionStatus.SUCCESS.toUpperCase()
                    ? TransactionStatus.SUCCESS
                    : TransactionStatus.FAIL;

            await this.transactionRepository.save(transaction);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    public async capture(
        merchantId: string,
        sdkOrderId: string,
        body: CaptureDto,
    ): Promise<any> {
        await this.ensureValidToken();
        const url = `${this.baseUrl}/merchants/${merchantId}/sdk-orders/${sdkOrderId}/capture`;

        const payload: any = {
            amount: body.amount,
        };
        if (body.splitWith) {
            payload.splitWith = {
                merchantId: body.splitWith.merchantId,
                amount: body.splitWith.amount,
            };
        }
        const { data } = await this.httpService.axiosRef.post(url, payload, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        });
        const transaction = await this.transactionRepository.findOne({
            where: { sdkOrderId },
        });
        if (!transaction)
            throw new NotFoundException(`Transaction ${sdkOrderId} not found`);
        transaction.status = TransactionStatus.SUCCESS;
        await this.transactionRepository.save(transaction);
        return data;
    }

    // cancel transaction
    // {{baseUrl}}/merchants/:merchantId/sdk-orders/:sdkOrderId/cancel
    public async cancelTransaction(
        merchantId: string,
        sdkOrderId: string,
        cancellationReason?: string,
    ): Promise<any> {
        await this.ensureValidToken();
        const url = `${this.baseUrl}/merchants/${merchantId}/sdk-orders/${sdkOrderId}/cancel`;
        const payload: any = {};
        if (cancellationReason) {
            payload.cancellationReason = cancellationReason;
        }

        // My DB update step :
        const transaction = await this.transactionRepository.findOne({
            where: { sdkOrderId },
        });
        if (!transaction) {
            throw new NotFoundException(`Transaction ${sdkOrderId} not found`);
        }
        transaction.status = TransactionStatus.CANCELLED;
        transaction.cancelledAt = new Date();
        await this.transactionRepository.save(transaction);

        const { data } = await this.httpService.axiosRef.post(url, payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        return data;
    }

    // {{baseUrl}}/merchants/:merchantId/sdk-orders/:sdkOrderId/refund
    public async refund(
        merchantId: string,
        sdkOrderId: string,
        refundReason?: string,
        refundAmount?: number,
    ): Promise<any> {
        await this.ensureValidToken();

        const url = `${this.baseUrl}/merchants/${merchantId}/sdk-orders/${sdkOrderId}/refund`;

        const payload: any = {};
        if (refundReason) payload.refundReason = refundReason;
        if (refundAmount) payload.refundAmount = refundAmount;

        const { data } = await this.httpService.axiosRef.post(url, payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        return data;
    }

    public async setupTokenized3DS(
        creditDebitCardId: string,
        sdkOrderId: string,
    ): Promise<any> {
        await this.ensureValidToken();
        const url = `${this.baseUrl}/credit-debit-cards/${creditDebitCardId}/setup-tokenized-3ds`;
        const payload: any = { sdkOrder: { id: sdkOrderId } };
        const { data } = await this.httpService.axiosRef.post(url, payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });

        if (data.statusCode === 200) {
            return data.data.payerAuthentication;
        } else {
            throw new Error(`3DS setup failed: ${data.message || 'Unknown error'}`);
        }
    }
    public async tokenizeGuestCard(dto: TokenizeCardDto) {
        await this.ensureValidToken();
        const payload = {
            csFlexCard: dto.csFlexCard,
            billingInfo: dto.billingInfo,
            securityCode: dto.securityCode,
        };

        const url = `${this.baseUrl}/credit-debit-cards/tokenize-guest-card`;
        const response = await this.httpService.axiosRef.post(url, payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        return response.data.data.creditDebitCard;
    }

    // {{baseUrl}}/credit-debit-cards/{{creditDebitCardId}}/check-3ds-enrollment
    public async check3dsEnrollment(
        creditDebitCardId: string,
        dto: Check3dsEnrollmentType,
    ): Promise<any> {
        try {
            await this.ensureValidToken();
            const url = `${this.baseUrl}/credit-debit-cards/${creditDebitCardId}/check-3ds-enrollment`;
            const payload = {
                csAuthentication: dto.csAuthentication,
                sdkOrderId: dto.sdkOrderId,
                payerAuthSetupReferenceId: dto.payerAuthSetupReferenceId,
            };
            const { data } = await this.httpService.axiosRef.post(url, payload, {
                headers: { Authorization: `Bearer ${this.accessToken}` },
            });

            if (data.statusCode === 200) {
                return data.data.payerAuthenticationEnrollment;
            } else {
                throw new Error(
                    `3DS enrollment check failed: ${data.message || 'Unknown error'}`,
                );
            }
        } catch (err) {
            throw new InternalServerErrorException(
                `Failed to check 3DS enrollment: ${err.message || err}`,
            );
        }
    }
    public async guestConfirm(
        sdkOrderId: string,
        creditCardId: string,
        consumerAuthenticationInformation: any,
    ): Promise<any> {
        await this.ensureValidToken();
        const url = `${this.baseUrl}/sdk-orders/${sdkOrderId}/guest-confirm`;

        const payload = {
            creditCardId,
            consumerAuthenticationInformation,
        };
        const { data } = await this.httpService.axiosRef.post(url, payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        return data.data.sdkOrder;
    }

    // --data '{
    //   "cardIds": [
    //     "7c592ad9-54c5-4f64-a9c0-452f6d37a5a2",
    //     "482080c0-bcd4-47de-8e7c-601f27b824a9"
    //   ]
    // }'

    public async getGuestCardsInformation(cardIds: string[]): Promise<any> {
        await this.ensureValidToken();
        const url = `${this.baseUrl}/credit-debit-cards/get-guest-cards-information`;
        const { data } = await this.httpService.axiosRef.post(
            url,
            { cardIds },
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            },
        );
        return data.data.cards[0];
    }
}