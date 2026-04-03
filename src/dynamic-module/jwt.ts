import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';

export const JWT = JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET') || 'defaultSecret';
        const expiresIn = configService.get('JWT_EXPIRES_IN') || '1h';

        return {
            secret,
            signOptions: {expiresIn},
        };
    }
});
