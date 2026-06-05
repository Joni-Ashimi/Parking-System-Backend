import {
    IsNumber,
    IsOptional,
    IsPositive,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CaptureSplitWithDto {
    @IsUUID()
    merchantId: string;

    @IsNumber()
    @IsPositive()
    amount: number;
}

export class CaptureDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => CaptureSplitWithDto)
    splitWith?: CaptureSplitWithDto;
}