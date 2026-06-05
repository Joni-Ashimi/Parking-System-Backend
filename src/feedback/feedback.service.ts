import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Brackets, Repository} from 'typeorm';
import {User} from '../entity/User';
import {CreateFeedbackDto} from '../def/dto/feedback/CreateFeedbackDto';
import {EmailService} from '../email/email.service';
import {Feedback} from "../entity/Feedback";

@Injectable()
export class FeedbackService {
    constructor(
        @Inject('CLOUDINARY') private readonly cloudinary: any,
        @InjectRepository(Feedback)
        private readonly feedbackRepo: Repository<Feedback>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly emailService: EmailService,
    ) {
    }

    private async uploadMultipleToCloudinary(files: Express.Multer.File[]): Promise<string[]> {
        if (!files || files.length === 0) return [];

        const uploadPromises = files.map(
            (file) =>
                new Promise<{ secure_url: string }>((resolve, reject) => {
                    const uploadStream = this.cloudinary.uploader.upload_stream(
                        {folder: 'parking_feedback', resource_type: 'image'},
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result as { secure_url: string });
                        },
                    );
                    uploadStream.end(file.buffer);
                }),
        );

        const results = await Promise.all(uploadPromises);
        return results.map((result) => result.secure_url);
    }

    async create(userId: string, dto: CreateFeedbackDto, files?: Express.Multer.File[]) {
        const user = await this.userRepo.findOne({where: {id: userId}});
        if (!user) throw new NotFoundException('User not found');

        const photoUrls = files && files.length > 0
            ? await this.uploadMultipleToCloudinary(files)
            : [];

        const feedback = this.feedbackRepo.create({
            ...dto,
            photos: photoUrls,
            user
        });
        const saved = await this.feedbackRepo.save(feedback);

        await this.emailService.sendFeedbackNotification(process.env.TEST_EMAIL ?? '', {
            userEmail: user.email,
            category: dto.category,
            subject: dto.subject,
            message: dto.message,
        });

        return saved;
    }

    async findAll(query: { page: number; pageSize: number; qs?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }) {
        const {page, pageSize, qs, sortBy, sortOrder} = query;
        const queryBuilder = this.feedbackRepo.createQueryBuilder('feedback')
            .leftJoinAndSelect('feedback.user', 'user');

        if (qs && qs.trim() !== '') {
            const searchPattern = `%${qs.trim()}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('feedback.subject ILIKE :qs', {qs: searchPattern})
                        .orWhere('user.name ILIKE :qs', {qs: searchPattern})
                        .orWhere('user.email ILIKE :qs', {qs: searchPattern});
                }),
            );
        }

        const allowedSortFields = ['createdAt', 'category', 'subject'];
        const sortField = sortBy && allowedSortFields.includes(sortBy)
            ? `feedback.${sortBy}`
            : 'feedback.createdAt';

        const direction = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        queryBuilder.orderBy(sortField, direction);

        const skip = (page - 1) * pageSize;
        queryBuilder.skip(skip).take(pageSize);
        const [data, total] = await queryBuilder.getManyAndCount();

        return {data, total};
    }

    async findMyFeedback(userId: string) {
        return this.feedbackRepo.find({
            where: {user: {id: userId}},
            order: {createdAt: 'DESC'},
        });
    }

    async findOne(id: string) {
        const feedback = await this.feedbackRepo.findOne({
            where: {id},
            relations: ['user'],
        });
        if (!feedback) throw new NotFoundException('Feedback not found');
        return feedback;
    }

    async updateStatus(id: string, status: string) {
        const feedback = await this.findOne(id);
        feedback.status = status;
        return this.feedbackRepo.save(feedback);
    }

    async remove(id: string) {
        const result = await this.feedbackRepo.delete(id);
        if (result.affected === 0) throw new NotFoundException('Feedback not found');
        return result;
    }
}