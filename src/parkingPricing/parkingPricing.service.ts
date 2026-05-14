import {Injectable, NotFoundException} from '@nestjs/common';
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {SpotCategory} from "../entity/SpotCategory";
import {PricingRule} from "../entity/PricingRule";

@Injectable()
export class ParkingPricingService {
    constructor(
        @InjectRepository(SpotCategory)
        private spotCategoryRepository: Repository<SpotCategory>,

        @InjectRepository(PricingRule)
        private pricingRuleRepository: Repository<PricingRule>,
    ) {}

    async calculatePrice(spotTypeId: string, hours: number, date: Date) {
        const type = await this.spotCategoryRepository.findOne({
            where: { id: spotTypeId },
        });
        if (!type) throw new NotFoundException('Parking spot type not found');

        let price = hours >= 24
                ? type.baseDailyRate * Math.ceil(hours / 24)
                : type.baseHourlyRate * hours;

        const [rules, ruleCount] = await this.pricingRuleRepository.findAndCount({
            where: { spotCategory: { id: spotTypeId } },
        });

        for (const rule of rules) {
            if (!this.matches(rule, date)) continue;

            const delta = price * (rule.value / 100);

            price =
                rule.adjustmentType === 'DISCOUNT'
                    ? price - delta
                    : price + delta;
        }

        return Math.max(price, 0);
    }

    private matches(rule, date: Date) {
        const day = date.getDay();
        const hour = date.getHours();

        if (rule.dayOfWeek != null && rule.dayOfWeek !== day) return false;

        if (
            rule.startHour != null &&
            rule.endHour != null &&
            (hour < rule.startHour || hour > rule.endHour)
        ) {
            return false;
        }

        return true;
    }
}