import {BadRequestException, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {User} from "../entity/User";
import {PaginationQuery} from "../def/pagination-query";
import {CreateUserDto} from "../def/dto/user/CreateUserDto";
import {UpdateUserDto} from "../def/dto/user/UpdateUserDto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async getUser(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with Id: ${id} not found!`);
        return user;
    }

    async create(createUser: CreateUserDto): Promise<User> {
        const user = this.usersRepository.create({
            ...createUser,
        });
        return this.usersRepository.save(user);
    }

    async findOne(id: string, relations: string[] = []): Promise<User | null> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations,
        });
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found!`);
        }
        return user;
    }

    async getByEmailOrFail(email: string): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { email } });
        return user;
    }

    async partialUpdate(id: string, updateUser: UpdateUserDto): Promise<User> {
        const user = await this.getUser(id);
        if (updateUser.email && updateUser.email !== user.email) {
            const exists = await this.usersRepository.findOneBy({ email: updateUser.email });
            if (exists) throw new BadRequestException('Email already in use');
        }

        const updatedUser = this.usersRepository.merge(user, updateUser);
        return this.usersRepository.save(updatedUser);
    }

    async delete(id: string) {
        const existingUser = await this.usersRepository.findOne({ where: { id } });
        if (!existingUser)
            throw new NotFoundException(`User with Id: ${id} not found!`);
        await this.usersRepository.softDelete(id);
        return { message: `User ${id} has been soft-deleted` };
    }

    async findAll({ qs, pageSize, page }: PaginationQuery): Promise<User[]> {
        return this.usersRepository.find({
            where: [{ email: ILike(`%${qs}%`) }, { name: ILike(`%${qs}%`) }],
            take: pageSize,
            skip: (page - 1) * pageSize,
            order: { name: 'ASC' },
        });
    }

    async updatePassword(userId: string, hashedPassword: string) {
        await this.usersRepository.update(
            { id: userId },
            { password: hashedPassword },
        );

        await this.usersRepository.increment(
            { id: userId },
            'tokenVersion',
            1,
        );
    }

    async incrementTokenVersion(userId: string) {
        await this.usersRepository.increment(
            { id: userId },
            'tokenVersion',
            1,
        );
    }
}
