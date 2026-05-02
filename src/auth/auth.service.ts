import {BadRequestException, Injectable, NotFoundException, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {ConfigService} from '@nestjs/config';
import {UsersService} from "../users/users.service";
import {CreateUserDto} from "../def/dto/user/CreateUserDto";
import {MoreThan, Repository} from "typeorm";
import {PasswordReset} from "../entity/PasswordReset";
import {RequestPasswordDto} from "../def/dto/passwordReset/requestPasswordDto";
import {EmailService} from "../email/email.service";
import {ConfirmPasswordDto} from "../def/dto/passwordReset/confirmPasswordDto";
import {InjectRepository} from "@nestjs/typeorm";

type JwtPayload = {
    id: string;
    email: string;
    name: string;
    tokenVersion: number;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,

        @InjectRepository(PasswordReset)
        private readonly passwordResetRepository: Repository<PasswordReset>

    ) {}

    private generateUserWithToken(payload: JwtPayload) {
        const accessToken = this.jwtService.sign<JwtPayload>(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
        });
        const refreshToken = this.jwtService.sign<JwtPayload>(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') as any,
        });
        return {
            user: {
                id: payload.id,
                email: payload.email,
                name: payload.name,
                tokenVersion: payload.tokenVersion,
            },
            accessToken,
            refreshToken,
        };
    }

    async register(createUser: CreateUserDto) {
        const existingUser = await this.usersService.getByEmailOrFail(
            createUser.email,
        );
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        if (createUser.password !== createUser.confirmPassword) {
            throw new BadRequestException('Password Confirm does not match password');
        }

        const hashedPassword = await bcrypt.hash(createUser.password, 10);

        const user = await this.usersService.create({
            ...createUser,
            password: hashedPassword,
        });
        const payload = {id: user.id, email: user.email, name: user.name, tokenVersion: user.tokenVersion};
        return this.generateUserWithToken(payload);
    }

    async login(email: string, password: string) {
        const existingUser = await this.usersService.findByEmail(email);
        const match = await bcrypt.compare(password, existingUser.password);
        if (!match) throw new UnauthorizedException('Invalid credentials');
        const payload = {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            tokenVersion: existingUser.tokenVersion,
        };
        await this.usersService.partialUpdate(existingUser?.id, {
            lastLoginAt: new Date(),
        });
        return this.generateUserWithToken(payload);
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }
        try {
            const payload: JwtPayload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });
            const user = await this.usersService.findOne(payload.id);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            if (user.tokenVersion !== payload.tokenVersion) {
                throw new UnauthorizedException('Token expired');
            }

            const newAccessToken = this.jwtService.sign(
                {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    tokenVersion: user.tokenVersion,
                },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
                },
            );
            return {
                accessToken: newAccessToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    tokenVersion: user.tokenVersion,
                },
            };
        } catch (err) {
            console.error('Error verifying refresh token:', err);
            throw new UnauthorizedException('Refresh token expired or invalid');
        }
    }

    async requestPasswordChange(userId: string, dto: RequestPasswordDto) {
        const user = await this.usersService.findOne(userId);
        if (!user) throw new NotFoundException('User not found');
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await this.passwordResetRepository.save({
            user,
            codeHash,
            expiresAt,
        });

        await this.emailService.sendPasswordRequestCode(user?.email, {email: user.email, code});
        return {message: 'Verification code sent to email'};
    }

    async confirmPasswordChange(userId: string, dto: ConfirmPasswordDto) {
        const user = await this.usersService.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        const record = await this.passwordResetRepository.findOne({
            where: {
                user: {id: userId},
                expiresAt: MoreThan(new Date()),
            },
            order: {createdAt: 'DESC'},
        });
        if (!record) throw new NotFoundException('No valid reset request found');

        const isCodeValid = await bcrypt.compare(dto.code, record.codeHash);
        if (!isCodeValid) throw new BadRequestException('Invalid verification code');

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.usersService.updatePassword(userId, hashedPassword);
        await this.usersService.incrementTokenVersion(userId);
        await this.usersService.partialUpdate(userId, {lastPasswordResetAt: new Date()})

        // Update the column of user lastPasswordResetAt
        await this.passwordResetRepository.delete({id: record.id});
        return {message: 'Password updated successfully'};
    }
}