import {IsEmail, IsOptional, IsString, IsUrl} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    lastLoginAt?: Date;

    @IsOptional()
    @IsUrl()
    profileImageUrl?: string;

    @IsOptional()
    lastPasswordResetAt?: Date;
}