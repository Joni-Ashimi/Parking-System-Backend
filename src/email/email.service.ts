import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendPasswordRequestCode(
        to: string,
        data: { email: string, code: string },
    ) {
        await this.mailerService.sendMail({
            from: `"Parking App" <${process.env.TEST_EMAIL}>`,
            to,
            subject: `Your password reset code`,
            template: 'resetPassword',
            context: {
                email: data.email,
                code: data.code,
            },
        });
    }
}