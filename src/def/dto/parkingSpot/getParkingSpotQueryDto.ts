import { IsOptional, IsInt, Min, IsUUID, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetParkingSpotsQueryDto {
    @IsOptional()
    @IsUUID()
    lotId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10;

    @IsOptional()
    @IsString()
    qs?: string;
}