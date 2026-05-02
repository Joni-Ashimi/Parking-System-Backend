import { IsEnum, IsOptional } from "class-validator";
import {ViolationStatus} from "../../enums/ViolationStatus";

export class UpdateViolationDto {
    @IsOptional()
    @IsEnum(ViolationStatus)
    status?: ViolationStatus;
}