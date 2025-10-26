// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    console.log('🏗️ JWT Strategy Constructor');
    const secret = configService.get<string>('JWT_SECRET') || '420187133769';
    console.log('🔑 JWT_SECRET:', secret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    console.log('✅ JWT Strategy initialisiert');
  }

  async validate(payload: any) {
    console.log('🔐 JWT validate() aufgerufen');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const userId = payload.sub;

    if (!userId) {
      console.log('❌ Keine userId im Payload');
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersService.findOne(userId);

    if (!user) {
      console.log('❌ User nicht in DB gefunden:', userId);
      throw new UnauthorizedException('User not found');
    }

    console.log('✅ User validiert:', user.email, user.role);

    // Das wird zu req.user
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
  }
}