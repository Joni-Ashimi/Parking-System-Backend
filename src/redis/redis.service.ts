import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import Redlock from 'redlock';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
    private readonly logger = new Logger(RedisService.name);

    private redisClient: RedisClientType;
    private redlock: Redlock;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST');
        const port = this.configService.get<number>('REDIS_PORT') || 6379;

        if (!host) {
            this.logger.warn('Redis disabled (no host provided)');
            return;
        }

        this.redisClient = createClient({
            socket: {
                host,
                port,
                reconnectStrategy: () => {
                    return false;
                },
            },
        });

        this.redisClient.on('error', (err) => {
            this.logger.warn('Redis error (ignored): ' + err.message);
        });

        try {
            await this.redisClient.connect();

            this.redlock = new Redlock([this.redisClient as any], {
                retryCount: 1,
            });

            this.logger.log('Redis connected');
        } catch (err) {
            this.logger.warn('Redis unavailable — continuing without it');

            this.redisClient = null as any;
            this.redlock = null as any;
        }
    }

    async withResourceLock<T>(resourceId: string, fn: () => Promise<T>): Promise<T> {
        if (!this.redlock) {
            return fn(); // fallback mode
        }

        const resource = `lock:${resourceId}`;
        const ttl = 15000;

        try {
            const lock = await this.redlock.acquire([resource], ttl);

            try {
                this.logger.log(`Acquired lock for resource ${resourceId}`);
                return await fn();
            } finally {
                await lock.unlock();
                this.logger.log(`Released lock for resource ${resourceId}`);
            }

        } catch (err) {
            this.logger.warn('Redis lock failed — running without lock');
            return fn();
        }
    }
}