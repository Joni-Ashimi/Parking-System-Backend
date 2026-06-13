import {BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from "../entity/User";
import {PaginationQuery} from "../def/pagination-query";
import {UpdateUserDto} from "../def/dto/user/UpdateUserDto";
import {UserVerificationStatus} from "../def/enums/UserVerificationStatus";
import {ViolationStatus} from "../def/enums/ViolationStatus";
import {ViolationType} from "../def/enums/ViolationType";
import {Violation} from "../entity/Violation";
import {EmailService} from "../email/email.service";

export interface GlobalStatsDto {
    total: number;
    verified: number;
    pending: number;
    banned: number;
}

@Injectable()
export class UsersService {
    constructor(
        @Inject('CLOUDINARY') private readonly cloudinary: any,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Violation)
        private readonly violationRepository: Repository<Violation>,
        private readonly emailService: EmailService,
    ) {
    }

    private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        if (!file) throw new BadRequestException('Image is required!');
        const result = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
                const uploadStream = this.cloudinary.uploader.upload_stream(
                    {folder: 'parking_user_profile_image', resource_type: 'image'},
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

    async create(createUser: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(createUser);
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

    async deleteUser(id: string) {
        const existingUser = await this.usersRepository.findOne({where: {id}});
        if (!existingUser) {
            throw new NotFoundException(`User with Id: ${id} not found!`);
        }

        await this.usersRepository.softDelete(id);
        return {message: `User ${id} has been soft-deleted`};
    }

    async deleteMe(id: string) {
        const existingUser = await this.usersRepository.findOne({where: {id}});
        if (!existingUser)
            throw new NotFoundException(`User with Id: ${id} not found!`);
        await this.usersRepository.softDelete(id);
        return {message: `User ${id} has been soft-deleted`};
    }

    async findAll({qs = "", pageSize = 10, page = 1, sortBy = "createdAt", sortOrder = "DESC",}: PaginationQuery) {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');

        if (qs) {
            queryBuilder.where('user.name ILike :qs ' +
                'OR user.email ILike :qs' +
                'OR user.phoneNumber ILike :qs', {qs: `%${qs}%`});
        }
        if (sortBy) {
            const normalizedOrder = (sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
            queryBuilder.orderBy(`user.${sortBy}`, normalizedOrder);
        } else {
            queryBuilder.orderBy('user.createdAt', 'DESC');
        }

        const [data, total] = await queryBuilder
            .take(pageSize)
            .skip((page - 1) * pageSize)
            .getManyAndCount();

        return {
            data,
            total,
            page,
            pageSize,
        };
    }

    async getUsersStats(): Promise<GlobalStatsDto> {
        try {
            const rawStats = await this.usersRepository
                .createQueryBuilder('user')
                .select('user.verificationStatus', 'status')
                .addSelect('COUNT(user.id)', 'count')
                .groupBy('user.verificationStatus')
                .getRawMany();

            const stats: GlobalStatsDto = {
                total: 0,
                verified: 0,
                pending: 0,
                banned: 0,
            };

            rawStats.forEach((row) => {
                const count = parseInt(row.count, 10);
                stats.total += count;

                switch (row.status?.toLowerCase()) {
                    case 'verified':
                        stats.verified = count;
                        break;
                    case 'pending':
                        stats.pending = count;
                        break;
                    case 'banned':
                        stats.banned = count;
                        break;
                }
            });

            return stats;
        } catch (error) {
            throw new InternalServerErrorException(
                'Failed to calculate user status metrics via group aggregation',
            );
        }
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
        const violation = await this.violationRepository.findOne({where: {user: {id: userId}}});
        if (violation) {
            await this.violationRepository.update(violation.id, {
                status: ViolationStatus.RESOLVED,
                updatedAt: new Date(),
                resolvedAt: new Date(),
            });
        }

        try {
            await this.emailService.sendUserActivationNotice(user.email, {
                name: user.name,
            });
        } catch (emailError) {
            console.error(`Failed to send activation email to ${user.email}:`, emailError);
        }
        return {message: `User ${userId} has been activated`};
    }

    async banUser(userId: string, reason?: string, penaltyAmount?: number, violationType?: ViolationType) {
        const user = await this.getUser(userId);
        if (!user) throw new NotFoundException(`User with Id: ${userId} not found!`);
        await this.usersRepository.update(
            {id: userId},
            {verificationStatus: UserVerificationStatus.BANNED},
        );

        const violationData: Partial<Violation> = {
            user: {id: user.id} as any,
            type: violationType ?? ViolationType.OTHER,
            description: reason || 'User was banned by administrator',
            penaltyAmount,
            status: ViolationStatus.PENDING,
        };

        const violation = this.violationRepository.create(violationData);
        await this.violationRepository.save(violation);

        try {
            console.log('calling email service');
            await this.emailService.sendUserBanEmail(user.email, {
                reason: violationData.description,
                penaltyAmount,
            });
        } catch (emailError) {
            console.error(`Failed to send ban email to ${user.email}:`, emailError);
        }


        return {message: `User ${user?.name} has been banned`};
    }
}
