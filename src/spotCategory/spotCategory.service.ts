import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {SpotCategory} from '../entity/SpotCategory';
import {CreateSpotCategoryDto} from "../def/dto/spotCategory/createSpotCategoryDto";
import {UpdateSpotCategoryDto} from "../def/dto/spotCategory/updateSpotCategoryDto";

@Injectable()
export class SpotCategoryService {
    constructor(
        @InjectRepository(SpotCategory)
        private readonly spotCategoryRepository: Repository<SpotCategory>,
        private readonly dataSource: DataSource,
    ) {
    }

    async create(dto: CreateSpotCategoryDto): Promise<SpotCategory> {
        const existing = await this.spotCategoryRepository.findOne({
            where: {code: dto.code},
        });

        if (existing) {
            throw new ConflictException(`Spot Category with code "${dto.code}" already exists.`);
        }

        const category = this.spotCategoryRepository.create(dto);
        return this.spotCategoryRepository.save(category);
    }

    async findAll(): Promise<SpotCategory[]> {
        return this.spotCategoryRepository.find({
            relations: ['rules'],
        });
    }

    async findOne(id: string): Promise<SpotCategory> {
        const category = await this.spotCategoryRepository.findOne({
            where: {id},
            relations: ['rules'],
        });

        if (!category) {
            throw new NotFoundException(`Spot Category with ID "${id}" not found.`);
        }

        return category;
    }

    async update(id: string, dto: UpdateSpotCategoryDto): Promise<SpotCategory> {
        const category = await this.findOne(id);
        Object.assign(category, dto);
        return this.spotCategoryRepository.save(category);
    }

    async remove(id: string): Promise<void> {
        const category = await this.findOne(id);
        await this.spotCategoryRepository.softRemove(category);
    }

    async getPricingDashboardData() {
        const categories = await this.spotCategoryRepository.find({
            relations: ['spots', 'rules'],
        });

        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();

        return categories.map((category) => {
            // Find a rule valid right now, safely forcing numeric matching
            const activeRule = category.rules?.find((rule) => {
                const ruleDay = rule.dayOfWeek !== null ? Number(rule.dayOfWeek) : null;
                const ruleStart = rule.startHour !== null ? Number(rule.startHour) : null;
                const ruleEnd = rule.endHour !== null ? Number(rule.endHour) : null;

                const matchesDay = ruleDay === null || ruleDay === currentDay;
                const matchesHour =
                    ruleStart === null || ruleEnd === null ||
                    (currentHour >= ruleStart && currentHour < ruleEnd);

                return matchesDay && matchesHour;
            });

            const baseHourly = Number(category.baseHourlyRate);
            let effectiveHourlyRate = baseHourly;

            if (activeRule) {
                const ruleValue = Number(activeRule.value);
                if (activeRule.adjustmentType === 'DISCOUNT') {
                    effectiveHourlyRate = baseHourly * (1 - ruleValue / 100);
                } else {
                    effectiveHourlyRate = baseHourly * (1 + ruleValue / 100);
                }
            }

            return {
                id: category.id,
                type: category.name,
                vehicleType: category.code.toLowerCase(),
                basePrice: baseHourly,
                hourlyRate: baseHourly,
                dailyRate: Number(category.baseDailyRate),
                size: category.size,
                spots: category.spots ? category.spots.length : 0,

                // Values sent out cleanly to the client layout
                effectiveHourlyRate: Number(Math.max(0, effectiveHourlyRate).toFixed(2)),
                isDiscounted: effectiveHourlyRate < baseHourly,
                activeRuleName: activeRule ? activeRule.name : null,
            };
        });
    }

    async updateCategoryRates(id: string, hourlyRate: number, dailyRate: number): Promise<SpotCategory> {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const category = await transactionalEntityManager.findOne(SpotCategory, {
                where: {id},
                relations: ['spots']
            });

            if (!category) {
                throw new NotFoundException(`Pricing profile configuration reference ID ${id} not found.`);
            }

            category.baseHourlyRate = hourlyRate;
            category.baseDailyRate = dailyRate;

            const savedCategory = await transactionalEntityManager.save(category);

            return {
                ...savedCategory,
                id: savedCategory.id,
                type: savedCategory.name,
                vehicleType: savedCategory.code.toLowerCase(),
                basePrice: Number(savedCategory.baseHourlyRate),
                hourlyRate: Number(savedCategory.baseHourlyRate),
                dailyRate: Number(savedCategory.baseDailyRate),
                size: savedCategory.size,
                spots: savedCategory.spots ? savedCategory.spots.length : 0,
            } as any;
        });
    }
}