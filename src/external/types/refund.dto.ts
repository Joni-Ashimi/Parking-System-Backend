import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RefundDto {
    @IsOptional()
    @IsString()
    refundReason?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    refundAmount?: number;
}