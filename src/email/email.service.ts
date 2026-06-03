import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {
    }

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

    async sendUserBanEmail(
        to: string,
        data: { reason?: string; penaltyAmount?: number },
    ) {
        await this.mailerService.sendMail({
            from: `"Parking App" <${process.env.TEST_EMAIL}>`,
            to,
            subject: `Important Notice: Your account has been banned`,
            template: 'banEmail',
            context: {
                reason: data.reason,
                penaltyAmount: data.penaltyAmount,
            },
        });
    }

    async sendUserActivationNotice(
        to: string,
        data: { name: string },
    ) {
        await this.mailerService.sendMail({
            from: `"Parking App" <${process.env.TEST_EMAIL}>`,
            to,
            subject: `Your account has been activated!`,
            template: 'activateUser',
            context: {
                name: data.name,
            },
        });
    }
    async sendFeedbackNotification(
        to: string,
        data: { userEmail: string; category: string; subject: string; message: string },
    ) {
        await this.mailerService.sendMail({
            from: `"Parking App" <${process.env.TEST_EMAIL}>`,
            to,
            subject: `New Feedback: ${data.subject}`,
            html: `
                <h2>New Feedback Received</h2>
                <p><strong>From:</strong> ${data.userEmail}</p>
                <p><strong>Category:</strong> ${data.category}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${data.message}</p>
            `,
        });
    }
}