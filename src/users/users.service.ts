import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ILike, Repository} from 'typeorm';
import {User} from "../entity/User";
import {PaginationQuery} from "../def/pagination-query";
import {CreateUserDto} from "../def/dto/user/CreateUserDto";
import {UpdateUserDto} from "../def/dto/user/UpdateUserDto";
import {UserVerificationStatus} from "../def/enums/UserVerificationStatus";

@Injectable()
export class UsersService {
    constructor(
        @Inject('CLOUDINARY') private readonly cloudinary: any,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
    }

    private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        if (!file) throw new BadRequestException('Image is required!');
        const result = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
                const uploadStream = this.cloudinary.uploader.upload_stream(
                    { folder: 'parking_user_profile_image', resource_type: 'image' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result as { secure_url: string });
                    },
                );
                uploadStream.end(file.buffer);
            },
        );
        return result.secure_url;
    }


    async getUser(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {id}});
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
            where: {id},
            relations,
        });
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.usersRepository.findOne({where: {email}});
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found!`);
        }
        return user;
    }

    async getByEmailOrFail(email: string): Promise<User | null> {
        const user = await this.usersRepository.findOne({where: {email}});
        return user;
    }

    async partialUpdate(id: string, updateUser: UpdateUserDto): Promise<User> {
        const user = await this.getUser(id);
        if (updateUser.email && updateUser.email !== user.email) {
            const exists = await this.usersRepository.findOneBy({email: updateUser.email});
            if (exists) throw new BadRequestException('Email already in use');
        }

        const updatedUser = this.usersRepository.merge(user, updateUser);
        return this.usersRepository.save(updatedUser);
    }

    async updateAvatar(id: string, file: Express.Multer.File) {
        const user = await this.getUser(id);
        const imageUrl = await this.uploadToCloudinary(file);
        user.profileImageUrl = imageUrl;
        return this.usersRepository.save(user);
    }

    async delete(id: string) {
        const existingUser = await this.usersRepository.findOne({where: {id}});
        if (!existingUser)
            throw new NotFoundException(`User with Id: ${id} not found!`);
        await this.usersRepository.softDelete(id);
        return {message: `User ${id} has been soft-deleted`};
    }

    async findAll({qs = "", pageSize = 10, page = 1}: PaginationQuery) {
        const [data, total] = await this.usersRepository.findAndCount({
            where: [
                {email: ILike(`%${qs}%`)},
                {name: ILike(`%${qs}%`)},
            ],
            take: pageSize,
            skip: (page - 1) * pageSize,
            order: {name: "ASC"},
        });

        return {
            data,
            total,
            page,
            pageSize,
        };
    }

    async updatePassword(userId: string, hashedPassword: string) {
        await this.usersRepository.update(
            {id: userId},
            {password: hashedPassword},
        );

        await this.usersRepository.increment(
            {id: userId},
            'tokenVersion',
            1,
        );
    }

    async incrementTokenVersion(userId: string) {
        await this.usersRepository.increment(
            {id: userId},
            'tokenVersion',
            1,
        );
    }

    async activateUser(userId: string) {
        const user = await this.getUser(userId);
        if (!user) throw new NotFoundException(`User with Id: ${userId} not found!`);
        await this.usersRepository.update(
            {id: userId},
            {verificationStatus: UserVerificationStatus.VERIFIED},
        );
        return {message: `User ${userId} has been activated`};
    }

    async banUser(userId: string) {
        const user = await this.getUser(userId);
        if (!user) throw new NotFoundException(`User with Id: ${userId} not found!`);
        await this.usersRepository.update(
            {id: userId},
            {verificationStatus: UserVerificationStatus.BANNED},
        );
        return {message: `User ${userId} has been banned`};
    };
}
