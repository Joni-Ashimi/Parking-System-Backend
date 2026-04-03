import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { type PaginationQuery } from 'src/def/pagination-query';
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import { ValidationPipe } from 'src/pipes/joi-validator.pipe';
import Joi from "joi";
import type {CreateUser} from "../def/types/create-user.type";
import type {UpdateUser} from "../def/types/update-user.type";
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

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
        createUser: CreateUser,
    ) {
        return this.usersService.create(createUser);
    }

    @Get()
    findUsers(
        @Query(
            ValidationPipe.from(
                Joi.object({
                    qs: Joi.string().required(),
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

    @Patch(':id')
    update(
        @Param('id') id: string,
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
        updateUser: UpdateUser,
    ) {
        return this.usersService.update(id, updateUser);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}