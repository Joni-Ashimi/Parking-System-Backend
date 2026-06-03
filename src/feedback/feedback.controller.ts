import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from '../def/dto/feedback/CreateFeedbackDto';
import { CurrentLoggedInUser } from '../decorator/current-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Post()
    @UseInterceptors(FilesInterceptor('photos', 5))
    create(
        @CurrentLoggedInUser() user: { id: string },
        @Body() dto: CreateFeedbackDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.feedbackService.create(user.id, dto, files);
    }

    @Get()
    findAll() {
        return this.feedbackService.findAll();
    }

    @Get('my-feedback')
    findMyFeedback(@CurrentLoggedInUser() user: { id: string }) {
        return this.feedbackService.findMyFeedback(user.id);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.feedbackService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string,
    ) {
        return this.feedbackService.updateStatus(id, status);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.feedbackService.remove(id);
    }
}