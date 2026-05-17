import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PricingRule} from "../entity/PricingRule";
import {SpotCategory} from "../entity/SpotCategory";
import {CreatePricingRuleDto} from "../def/dto/pricingRule/CreatePricingRule";

@Injectable()
export class PricingRuleService {
    constructor(
        @InjectRepository(PricingRule)
        private readonly ruleRepo: Repository<PricingRule>,
        @InjectRepository(SpotCategory)
        private readonly categoryRepo: Repository<SpotCategory>,
    ) {
    }

    async getSpecialOffers() {
        const rules = await this.ruleRepo.find({
            relations: ['spotCategory'],
            order: {createdAt: 'DESC'},
        });

        const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return rules.map((rule) => {
            let timeContext = 'All day';
            if (rule.startHour !== null && rule.endHour !== null) {
                timeContext = `between ${rule.startHour}:00 and ${rule.endHour}:00`;
            }

            let dayContext = 'any day';
            if (rule.dayOfWeek !== null) {
                dayContext = `on ${DAYS_MAP[rule.dayOfWeek]}s`;
            }

            const formattedDescription = `${rule.adjustmentType === 'DISCOUNT' ? 'Save' : 'Surcharge of'} ${Number(rule.value)}% for ${rule.spotCategory.name} spots ${timeContext} ${dayContext}.`;
            return {
                id: rule.id,
                title: rule.name,
                description: formattedDescription,
                discount: rule.adjustmentType === 'DISCOUNT' ? `${Number(rule.value)}%` : `+${Number(rule.value)}%`,
                validUntil: 'Ongoing', // Can be mapped dynamically if expiration dates are added later
            };
        });
    }

    async createOffer(dto: CreatePricingRuleDto) {
        const category = await this.categoryRepo.findOne({where: {id: dto.spotCategoryId}});
        if (!category) {
            throw new NotFoundException(`Spot Category with ID ${dto.spotCategoryId} not found`);
        }

        const newRule = this.ruleRepo.create({
            name: dto.name,
            adjustmentType: dto.adjustmentType,
            value: dto.value,
            dayOfWeek: dto.dayOfWeek,
            startHour: dto.startHour,
            endHour: dto.endHour,
            spotCategory: category,
        });

        await this.ruleRepo.save(newRule);
        return this.getSpecialOffers();
    }

    async softDelete(id: string): Promise<void> {
        const result = await this.ruleRepo.softDelete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Special offer rule with ID "${id}" not found`);
        }
    }
}