import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import path from 'node:path';
import {HandlebarsAdapter} from "@nestjs-modules/mailer/adapters/handlebars.adapter";

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.TEST_EMAIL,
                        pass: process.env.TEST_EMAIL_PASSWORD,
                    },
                },
                defaults: {
                    from: `"Parking App" <${process.env.TEST_EMAIL}>`,
                },
                template: {
                    dir: path.join(process.cwd(), 'src/templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },

                tls: {
                    rejectUnauthorized: false,
                },
            }),
        }),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}