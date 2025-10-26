// auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(email, name, password);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    console.log('📍 /auth/me aufgerufen');
    console.log('👤 req.user:', req.user);
    
    return req.user;
  }

  @Get('test')
  @UseGuards(JwtAuthGuard)
  async test(@Request() req) {
    return {
      message: 'Auth funktioniert!',
      user: req.user,
      timestamp: new Date().toISOString()
    };
  }
}