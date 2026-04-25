import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    async getAll() {
        return this.notificationsService.findAll();
    }

    @Get(':userId')
    async getUserNotifications(@Param('userId') userId: string) {
        return this.notificationsService.findUserNotifications(userId);
    }

    @Get(':userId/unread')
    async getUserUnreadNotifications(@Param('userId') userId: string) {
        return this.notificationsService.findUnreadUserNotifications(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.notificationsService.delete(id);
    }
}