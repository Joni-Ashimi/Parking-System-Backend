import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {BadRequestException, ValidationPipe} from '@nestjs/common';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: false,
            forbidNonWhitelisted: false,
            transform: true,
            exceptionFactory: (errors) => {
                return new BadRequestException(errors);
            },
        }),
    );


    app.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
    });


    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Running on port ${port}`);
}

bootstrap();