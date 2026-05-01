import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtAuthGuard} from './guard/jwt-auth.guard';
import {User} from "../entity/User";
import {UsersModule} from "../users/users.module";
import {JwtAuthStrategy} from "./strategy/jwt-auth-strategy";
import {PassportModule} from '@nestjs/passport';
import {JWT} from "../dynamic-module/jwt";
import {EmailModule} from "../email/email.module";
import {PasswordReset} from "../entity/PasswordReset";

@Module({
    imports: [TypeOrmModule.forFeature([User, PasswordReset]), UsersModule, JWT, EmailModule,
        PassportModule.register({defaultStrategy: 'jwt-auth'}),
    ],
    providers: [AuthService, JwtAuthStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {
}