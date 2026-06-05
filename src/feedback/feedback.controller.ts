import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {FeedbackService} from './feedback.service';
import {CreateFeedbackDto} from '../def/dto/feedback/CreateFeedbackDto';
import {CurrentLoggedInUser} from '../decorator/current-user.decorator';
import {JwtAuthGuard} from '../auth/guard/jwt-auth.guard';
import {FilesInterceptor} from '@nestjs/platform-express';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {
    }

    @Post()
    @UseInterceptors(FilesInterceptor('photos', 5))
    async createFeedback(
        @CurrentLoggedInUser() user: { id: string },
        @Body() createFeedbackDto: CreateFeedbackDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.feedbackService.create(user.id, createFeedbackDto, files);
    }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Query('qs') qs?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    ) {
        return this.feedbackService.findAll({
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            qs,
            sortBy,
            sortOrder,
        });
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