import {
    Controller,
    Get,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    Delete,
    HttpCode,
    HttpStatus,
    Param, ParseUUIDPipe
} from '@nestjs/common';
import {PricingRuleService} from "./pricingRule.service";
import {CreatePricingRuleDto} from "../def/dto/pricingRule/CreatePricingRule";

@Controller('offers')
export class PricingRuleController {
    constructor(private readonly ruleService: PricingRuleService) {}

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.ruleService.softDelete(id);
    }

    @Get()
    async getAllOffers() {
        return await this.ruleService.getSpecialOffers();
    }

    @Post()
    async createNewOffer(@Body() createRuleDto: CreatePricingRuleDto) {
        return await this.ruleService.createOffer(createRuleDto);
    }
}