import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { User } from '../entity/User';
import { CreateFeedbackDto } from '../def/dto/feedback/CreateFeedbackDto';
import { EmailService } from '../email/email.service';

@Injectable()
export class FeedbackService {
    constructor(
        @Inject('CLOUDINARY') private readonly cloudinary: any,
        @InjectRepository(Feedback)
        private readonly feedbackRepo: Repository<Feedback>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly emailService: EmailService,
    ) {}

    async create(userId: string, dto: CreateFeedbackDto, files?: Express.Multer.File[]) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        let photoUrls: string[] = [];

        if (files && files.length > 0) {
            const uploadPromises = files.map(file =>
                new Promise<string>((resolve, reject) => {
                    const uploadStream = this.cloudinary.uploader.upload_stream(
                        { folder: 'parking_feedback', resource_type: 'image' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(file.buffer);
                })
            );
            photoUrls = await Promise.all(uploadPromises);
        }

        const feedback = this.feedbackRepo.create({ ...dto, photos: photoUrls, user });
        const saved = await this.feedbackRepo.save(feedback);

        await this.emailService.sendFeedbackNotification(process.env.TEST_EMAIL ?? '', {
            userEmail: user.email,
            category: dto.category,
            subject: dto.subject,
            message: dto.message,
        });

        return saved;
    }

    async findAll() {
        return this.feedbackRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findMyFeedback(userId: string) {
        return this.feedbackRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        const feedback = await this.feedbackRepo.findOne({
            where: { id },
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