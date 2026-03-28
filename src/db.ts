import { TypeOrmModule } from '@nestjs/typeorm';

export const DB = TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false, // for dev purpose
});