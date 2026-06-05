import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {FeedbackController} from './feedback.controller';
import {FeedbackService} from './feedback.service';
import {User} from '../entity/User';
import {EmailModule} from '../email/email.module';
import {CloudinaryModule} from '../cloudinary/cloudinary.module';
import {Feedback} from "../entity/Feedback";


@Module({
    imports: [TypeOrmModule.forFeature([Feedback, User]), EmailModule, CloudinaryModule],
    controllers: [FeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule {
}