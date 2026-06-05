import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import {Item} from "../interfaces/create-item.interface";

export class SplitWithDto {
    @IsOptional()
    @IsUUID('4')
    merchantId?: string;

    @IsDefined({ message: 'percentage is required when merchantId is provided' })
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: 'percentage must be at least 0' })
    @Max(99, { message: 'percentage must be less than 100' })
    percentage?: number;

    @IsPhoneNumber('AL', {
        message: 'userPhoneNumber must be a valid albanian phone number',
    })
    userPhoneNumber?: string;
}

export class CreateTransactionDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0.01, { message: 'amount must be greater than zero' })
    amount?: number;

    @IsString()
    currencyCode: string; // ALL / EUR

    @IsArray()
    @ValidateNested({ each: true })
    products?: Item[]; // not array cause one auction has only one item ?

    @Type(() => Boolean)
    @IsBoolean()
    autoCapture: boolean;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: 'shippingCost must be non-negative' })
    shippingCost?: number;

    @IsOptional()
    @IsUrl({}, { message: 'webhookUrl must be a valid URL' })
    webhookUrl?: string;

    @IsOptional()
    @IsUrl({}, { message: 'redirectUrl must be a valid URL' })
    redirectUrl?: string;

    @IsOptional()
    @IsUrl({}, { message: 'failRedirectUrl must be a valid URL' })
    failRedirectUrl?: string;

    @IsOptional()
    @IsUrl({}, { message: 'deeplink must be a valid URL' })
    deeplink?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => SplitWithDto)
    splitWith?: SplitWithDto;

    @IsOptional()
    @IsString()
    merchantCustomReference?: string;

    @IsOptional()
    @IsUUID('4')
    selectedBranchId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(5, { message: 'expiresAfterMinutes must be at least 5' })
    expiresAfterMinutes?: number;
}