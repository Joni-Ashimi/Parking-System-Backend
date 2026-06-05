import { IsOptional, IsString } from 'class-validator';

export class CancellationDto {
    @IsOptional()
    @IsString()
    cancellationReason?: string;
}