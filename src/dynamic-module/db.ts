import {TypeOrmModule} from '@nestjs/typeorm';
import { join } from 'path';

export const DB = TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../entity/*{.ts,.js}',
        __dirname + '/../feedback/*.entity{.ts,.js}'],
    migrations: [join(__dirname, '../**/migrations/*{.ts,.js}')],
    synchronize: true,
});

console.log({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
});