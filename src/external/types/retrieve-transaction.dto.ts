import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RetrieveTransactionDto {
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    loadTransaction?: boolean;
}