import { PartialType } from '@nestjs/mapped-types';
import {CreateSpotCategoryDto} from "./createSpotCategoryDto";

export class UpdateSpotCategoryDto extends PartialType(CreateSpotCategoryDto) {}