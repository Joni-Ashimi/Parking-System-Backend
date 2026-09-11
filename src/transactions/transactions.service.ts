import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateTransactionDto } from '../external/types/create-transaction.dto';
import { ConfigService } from '@nestjs/config';
import { PokApiService } from '../external/pok-api.service';
import { RedisService } from '../redis/redis.service';
import { Transaction } from '../entity/Transaction';
import { TransactionStatus } from '../def/enums/TransactionStatus';
import {
  FindTransactionsOptions,
  PaginationQuery,
} from '../def/pagination-query';
import { ParkingSession } from '../entity/ParkingSession';
import { ParkingSessionStatus } from '../def/enums/ParkingSessionStatus';
import { Card } from '../entity/Card';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class TransactionsService {
  private readonly merchantId: string;

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(ParkingSession)
    private readonly parkingSessionRepository: Repository<ParkingSession>,
    @InjectRepository(Card)
    private readonly cardsRepository: Repository<Card>,
    @Inject()
    private readonly configService: ConfigService,
    private readonly pokApiService: PokApiService,
    private readonly redisService: RedisService,
    private readonly cardsService: CardsService,
  ) {
    this.merchantId = this.configService.get<string>('POK_MERCHANT_ID') ?? '';
  }

  private async findTransactionsPagination({
    qs = '',
    page,
    pageSize,
    status,
    relations = [],
  }: FindTransactionsOptions): Promise<{ data: Transaction[]; meta: any }> {
    const take = Number(pageSize) || 10;
    const skip = ((Number(page) || 1) - 1) * take;

    const where: FindOptionsWhere<Transaction> = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const [data, total] = await this.transactionsRepository.findAndCount({
      where,
      relations,
      order: { createdAt: 'DESC' },
      take,
      skip,
    });

    return {
      data,
      meta: {
        total,
        page: Number(page) || 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  private async cancelParkingPayment(sdkOrderId: string, reason: string) {
    try {
      await this.pokApiService.cancelTransaction(
        this.merchantId,
        sdkOrderId,
        reason,
      );
    } catch (err) {
      console.error('POK Cancellation Error:', err);
      throw new InternalServerErrorException(
        'Could not cancel payment at this time.',
      );
    }
  }

  private async finalizePayment(transactionId: string) {
    const transaction = await this.getTransactionById(transactionId);
    transaction.status = TransactionStatus.SUCCESS;
    transaction.updatedAt = new Date();

    await this.transactionsRepository.save(transaction);
    if (transaction.parkingSession) {
      await this.parkingSessionRepository.update(
        transaction.parkingSession.id,
        { status: ParkingSessionStatus.COMPLETED },
      );
    }
  }

  private async getTransactionById(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['parkingSession'],
    });
    if (!transaction)
      throw new NotFoundException(`Transaction with id ${id} not found`);
    return transaction;
  }

  async findAll(query: PaginationQuery, status?: string) {
    const relations = [
      'parkingSession',
      'parkingSession.spot',
      'parkingSession.spot.lot',
    ];
    return this.findTransactionsPagination({
      ...query,
      status,
      relations,
    });
  }

  async createParkingTransaction(payload: {
    amount: number;
    sessionId: string;
    currency: 'ALL' | 'EUR';
  }): Promise<Transaction> {
    const existingTransaction = await this.transactionsRepository.findOne({
      where: { parkingSession: { id: payload.sessionId } },
    });

    if (existingTransaction) {
      return existingTransaction;
    }

    const session = await this.parkingSessionRepository.findOne({
      where: { id: payload.sessionId },
    });
    if (!session) throw new BadRequestException('Parking session not found');

    const transactionPayload: CreateTransactionDto = {
      amount: payload.amount,
      currencyCode: payload.currency,
      autoCapture: true,
      description: `Parking session payment for session ${payload.sessionId}`,
      merchantCustomReference: this.merchantId,
      webhookUrl: process.env.WEBHOOK_PROXY_URL,
      products: [{ name: 'Parking Fee', quantity: 1, price: payload.amount }],
    };

    const response =
      await this.pokApiService.createTransaction(transactionPayload);
    const sdkOrder = response.data.sdkOrder;

    const transaction = this.transactionsRepository.create({
      sdkOrderId: sdkOrder.id,
      parkingSession: session,
      paymentCurrency: payload.currency,
      originalAmount: payload.amount,
      finalAmount: sdkOrder.finalAmount,
      status: TransactionStatus.ON_HOLD,
    });

    return await this.transactionsRepository.save(transaction);
  }

  async prepare3DS(sdkOrderId: string, cardId: string, userId: string) {
    return await this.cardsService.setupTokenized3DS(
      cardId,
      sdkOrderId,
      userId,
    );
  }

  async get3DSConfiguration(sdkOrderId: string, cardId: string) {
    const card = await this.cardsRepository.findOne({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');
    return await this.pokApiService.setupTokenized3DS(
      card.pokCardId,
      sdkOrderId,
    );
  }

  async finalizeParkingTransaction(sdkOrderId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { sdkOrderId },
      relations: ['parkingSession'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');

    transaction.status = TransactionStatus.SUCCESS;
    const savedTransaction =
      await this.transactionsRepository.save(transaction);

    if (transaction.parkingSession) {
      await this.parkingSessionRepository.update(
        transaction.parkingSession.id,
        { status: ParkingSessionStatus.COMPLETED },
      );
    }

    return savedTransaction;
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
    });
    if (!transaction) throw new Error(`Transaction with id ${id} not found`);
    return transaction;
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const originalTransaction = await this.findOne(id);
    const updatedTransaction = this.transactionsRepository.merge(
      originalTransaction,
      data,
    );
    return this.transactionsRepository.save(updatedTransaction);
  }

  async delete(id: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    await this.transactionsRepository.softDelete(id);
    return { message: `Transaction with ID ${id} has been soft-deleted` };
  }

  async getTransactionForParkingSession(parkingSessionId: string) {
    return this.transactionsRepository.findOne({
      where: { parkingSession: { id: parkingSessionId } },
    });
  }
}
