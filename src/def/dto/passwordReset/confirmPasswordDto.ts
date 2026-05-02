import {IsDate, IsString, MinLength} from "class-validator";

export class ConfirmPasswordDto {
    @IsString()
    @MinLength(6)
    code: string;

    @IsString()
    @MinLength(8)
    newPassword: string;

    @IsDate()
    lastPasswordResetAt: Date;
}