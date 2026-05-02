import { IsEnum, IsNumber, IsString } from "class-validator";
import {ViolationType} from "../../enums/ViolationType";

export class CreateViolationDto {
    @IsString()
    userId: string;

    @IsString()
    userName: string;

    @IsEnum(ViolationType)
    type: ViolationType;

    @IsString()
    description: string;

    @IsNumber()
    penaltyAmount: number;
}