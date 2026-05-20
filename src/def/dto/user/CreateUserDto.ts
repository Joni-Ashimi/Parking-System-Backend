import {IsEmail, IsString, MinLength, Matches, IsNotEmpty} from 'class-validator';
import {Column} from "typeorm";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(8)
    confirmPassword: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(\+?\d{1,3})?[\s-]?\d{9,14}$/, {
        message: 'Please provide a valid phone number format',
    })
    phoneNumber: string;

    @Column({nullable: false})
    @Matches(/^(MALE|FEMALE)$/, {
        message: 'Gender must be either MALE or FEMALE',
    })
    gender: string;
}