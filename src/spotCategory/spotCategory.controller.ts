import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {SpotCategoryService} from './spotCategory.service';
import {JwtAuthGuard} from '../auth/guard/jwt-auth.guard';
import {CreateSpotCategoryDto} from "../def/dto/spotCategory/createSpotCategoryDto";
import {UpdateSpotCategoryDto} from "../def/dto/spotCategory/updateSpotCategoryDto";

@Controller('spot-categories')
@UseGuards(JwtAuthGuard)
export class SpotCategoryController {
    constructor(private readonly spotCategoryService: SpotCategoryService) {
    }

    @Post()
    create(@Body() dto: CreateSpotCategoryDto) {
        return this.spotCategoryService.create(dto);
    }

    @Get()
    findAll() {
        return this.spotCategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.spotCategoryService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSpotCategoryDto,
    ) {
        return this.spotCategoryService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.spotCategoryService.remove(id);
    }
}