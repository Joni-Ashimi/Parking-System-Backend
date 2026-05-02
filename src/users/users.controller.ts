import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query, Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {type PaginationQuery} from 'src/def/pagination-query';
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {ValidationPipe} from 'src/pipes/joi-validator.pipe';
import Joi from "joi";
import {CurrentLoggedInUser} from "../decorator/current-user.decorator";
import {CreateUserDto} from "../def/dto/user/CreateUserDto";
import {UpdateUserDto} from "../def/dto/user/UpdateUserDto";
import {FileInterceptor} from "@nestjs/platform-express";

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
        return this.usersService.delete(user.id);
    }

    @Patch(':id/activate')
    activateUser(@Param('id') id: string) {
        return this.usersService.activateUser(id);
    }

    @Patch(':id/ban')
    banUser(@Param('id') id: string) {
        return this.usersService.banUser(id);
    }

    @Post()
    @UseGuards()
    create(
        @Body(
            ValidationPipe.from(
                Joi.object({
                    name: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required().min(8),
                    confirmPassword: Joi.string().required().min(8),
                }),
            ),
        )
        createUser: CreateUserDto,
    ) {
        return this.usersService.create(createUser);
    }

    @Get()
    findUsers(
        @Query(
            ValidationPipe.from(
                Joi.object({
                    qs: Joi.string().allow("").default(""),
                    page: Joi.number().positive().default(1),
                    pageSize: Joi.number().positive().default(10),
                }),
            ),
        )
        query: PaginationQuery,
    ) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}