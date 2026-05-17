import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {SpotCategory} from "../entity/SpotCategory";
import {PricingRule} from "../entity/PricingRule";
import {PricingRuleController} from "./pricingRule.controller";
import {PricingRuleService} from "./pricingRule.service";

@Module({
    imports: [TypeOrmModule.forFeature([SpotCategory, PricingRule])],
    controllers: [PricingRuleController],
    providers: [PricingRuleService],
    exports: [PricingRuleService],
})
export class PricingRuleModule {}
