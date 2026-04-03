import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {UsersService} from "../../users/users.service";

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    public async validate(payload: any): Promise<any> {
        if (!payload || !payload.id) {
            throw new UnauthorizedException();
        }
        const user = await this.userService.findOne(payload.id);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }

}