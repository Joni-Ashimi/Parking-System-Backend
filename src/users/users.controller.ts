import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {GlobalStatsDto, UsersService} from './users.service';
import {type PaginationQuery} from 'src/def/pagination-query';
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {ValidationPipe} from 'src/pipes/joi-validator.pipe';
import Joi from "joi";
import {CurrentLoggedInUser} from "../decorator/current-user.decorator";
import {UpdateUserDto} from "../def/dto/user/UpdateUserDto";
import {FileInterceptor} from "@nestjs/platform-express";
import {Roles} from "../decorator/roles.decorator";
import {UserType} from "../def/enums/UserType";
import {RolesGuard} from "../decorator/roles.guard";
import {ViolationType} from "../def/enums/ViolationType";

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {
    }

    @Patch('/me/avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.usersService.updateAvatar(req.user.id, file);
    }

    @Get('/me')
    getMe(@CurrentLoggedInUser() user: { id: string }) {
        return this.usersService.findOne(user.id);
    }

    @Patch('/me')
    update(
        @CurrentLoggedInUser() user: { id: string },
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.partialUpdate(user.id, dto);
    }

    @Delete('/me')
    remove(@CurrentLoggedInUser() user: { id: string }) {
        return this.usersService.deleteMe(user.id);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }

    @Patch(':id/activate')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    activateUser(@Param('id') id: string) {
        return this.usersService.activateUser(id);
    }

    @Patch(':id/ban')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    banUser(
        @Param('id') id: string,
        @Body() body: { reason?: string, penaltyAmount?: number, violationType?: ViolationType }
    ) {
        return this.usersService.banUser(
            id,
            body.reason,
            body.penaltyAmount,
            body.violationType
        );
    }

    @Get()
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    findUsers(
        @Query(
            ValidationPipe.from(
                Joi.object({
                    qs: Joi.string().allow("").default(""),
                    page: Joi.number().positive().default(1),
                    pageSize: Joi.number().positive().default(10),
                    sortBy: Joi.string().default("createdAt"),
                    sortOrder: Joi.string().valid("ASC", "DESC").default("DESC"),
                }),
            ),
        )
        query: PaginationQuery,
    ) {
        return this.usersService.findAll(query);
    }

    @Get('stats')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    async getUserStats(): Promise<GlobalStatsDto> {
        return await this.usersService.getUsersStats();
    }

    @Get(':id')
    @Roles(UserType.ADMIN)
    @UseGuards(RolesGuard)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}