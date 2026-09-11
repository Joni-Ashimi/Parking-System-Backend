import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../def/dto/user/CreateUserDto';
import { CurrentLoggedInUser } from '../decorator/current-user.decorator';
import { RequestPasswordDto } from '../def/dto/passwordReset/requestPasswordDto';
import { ConfirmPasswordDto } from '../def/dto/passwordReset/confirmPasswordDto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUser: CreateUserDto) {
    return this.authService.register(createUser);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/request')
  requestPassword(
    @CurrentLoggedInUser() user: { id: string },
    @Body() dto: RequestPasswordDto,
  ) {
    return this.authService.requestPasswordChange(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password/confirm')
  confirmPassword(
    @CurrentLoggedInUser() user: { id: string },
    @Body() dto: ConfirmPasswordDto,
  ) {
    return this.authService.confirmPasswordChange(user.id, dto);
  }
}
