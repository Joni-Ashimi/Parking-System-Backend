import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    HttpCode,
    HttpStatus,
    Param, ParseUUIDPipe, UseGuards
} from '@nestjs/common';
import {PricingRuleService} from "./pricingRule.service";
import {CreatePricingRuleDto} from "../def/dto/pricingRule/CreatePricingRule";
import {RolesGuard} from "../decorator/roles.guard";
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {Roles} from "../decorator/roles.decorator";
import {UserType} from "../def/enums/UserType";

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class PricingRuleController {
    constructor(private readonly ruleService: PricingRuleService) {}

    @Delete(':id')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.ruleService.softDelete(id);
    }

    @Get()
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    async getAllOffers() {
        return await this.ruleService.getSpecialOffers();
    }

    @Post()
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    async createNewOffer(@Body() createRuleDto: CreatePricingRuleDto) {
        return await this.ruleService.createOffer(createRuleDto);
    }
}