import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthUseCase } from '../../application/use-cases/auth.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return await this.authUseCase.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authUseCase.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return await this.authUseCase.validateUser(req.user.userId);
  }
}
