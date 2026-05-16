import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {SpotCategory} from '../entity/SpotCategory';
import {CreateSpotCategoryDto} from "../def/dto/spotCategory/createSpotCategoryDto";
import {UpdateSpotCategoryDto} from "../def/dto/spotCategory/updateSpotCategoryDto";

@Injectable()
export class SpotCategoryService {
    constructor(
        @InjectRepository(SpotCategory)
        private readonly spotCategoryRepository: Repository<SpotCategory>,
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
}