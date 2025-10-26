// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string) {
    console.log('🔍 validateUser aufgerufen mit ID:', userId);
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      console.log('❌ User nicht gefunden');
      return null;
    }
    
    console.log('✅ User gefunden:', user.email);
    return user;
  }

  async login(email: string, password: string) {
    console.log('🔐 Login-Versuch für:', email);
    
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      console.log('❌ User nicht gefunden');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Passwort falsch');
      throw new UnauthorizedException('Invalid credentials');
    }

    // WICHTIG: Payload mit 'sub' für userId
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const access_token = this.jwtService.sign(payload);
    
    console.log('✅ Token erstellt für User:', user.id);
    console.log('📦 Payload:', payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    };
  }

  async register(email: string, name: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.usersService.create({
      email,
      name,
      password: hashedPassword,
    });

    // Nach Registration automatisch einloggen
    return this.login(email, password);
  }
}