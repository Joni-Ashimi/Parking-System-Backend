import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SpotCategory} from '../entity/SpotCategory';
import {SpotCategoryController} from './spotCategory.controller';
import {SpotCategoryService} from './spotCategory.service';

@Module({
    imports: [TypeOrmModule.forFeature([SpotCategory])],
    controllers: [SpotCategoryController],
    providers: [SpotCategoryService],
    exports: [SpotCategoryService],
})
export class SpotCategoryModule {
}