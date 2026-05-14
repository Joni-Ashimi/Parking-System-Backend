import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {SpotCategory} from "../entity/SpotCategory";
import {Repository} from "typeorm";
import {PricingRule} from "../entity/PricingRule";

@Injectable()
export class ParkingAdminService {
    constructor(
        @InjectRepository(SpotCategory)
        private spotCategoryRepository: Repository<SpotCategory>,
        @InjectRepository(PricingRule)
        private pricingRuleRepository: Repository<PricingRule>,
    ) {
    }

    async getAllTypes() {
        return this.spotCategoryRepository.find({
            relations: ['spots', 'rules'],
        });
    }

    async updateBasePricing(typeId: string, data: {
        baseHourlyRate: number;
        baseDailyRate: number;
    }) {
        const type = await this.spotCategoryRepository.findOneBy({id: typeId});
        if (!type) throw new NotFoundException('Type not found');

        type.baseHourlyRate = data.baseHourlyRate;
        type.baseDailyRate = data.baseDailyRate;

        return this.spotCategoryRepository.save(type);
    }

    async createRule(typeId: string, rule: any) {
        return this.pricingRuleRepository.save({
            ...rule,
            type: {id: typeId},
        });
    }

    async deleteRule(ruleId: string) {
        return this.pricingRuleRepository.delete(ruleId);
    }
}