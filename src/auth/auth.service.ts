import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {UsersService} from "../users/users.service";
import {CreateUser} from "../def/types/create-user.type";

@Injectable()
export class AuthService {
  constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
  ) {}

  private generateUserWithToken(payload: { id: string }) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') as any,
    });
    return {
      user: {
        id: payload.id,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(createUser: CreateUser) {
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
    const payload = { id: user.id, email: user.email, name: user.name };
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
    };
    return this.generateUserWithToken(payload);
  }

  async refresh(userId: string, refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const payload: any = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      if (payload.id !== userId) {
        throw new UnauthorizedException('Token does not match user');
      }

      const user = await this.usersService.findOne(userId);
      if (!user) throw new UnauthorizedException('User not found');
      const newAccessToken = this.jwtService.sign(
          { id: user.id, email: user.email, name: user.name },
          {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') as any,
          },
      );

      return {
        accessToken: newAccessToken,
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (err) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }
}