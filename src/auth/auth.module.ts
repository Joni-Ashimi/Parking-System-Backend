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

@Module({
    imports: [TypeOrmModule.forFeature([User]), UsersModule, JWT,
        PassportModule.register({defaultStrategy: 'jwt-auth'}),
    ],
    providers: [AuthService, JwtAuthGuard, JwtAuthStrategy],
    controllers: [AuthController],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {
}