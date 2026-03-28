import { ConfigModule } from '@nestjs/config';

export const CONFIG = ConfigModule.forRoot({ isGlobal: true });