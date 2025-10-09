// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) {
        console.log('🏗️ JWT Strategy Constructor läuft!');
        console.log('🔑 JWT_SECRET:', configService.get<string>('JWT_SECRET'));

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || '420187133769',
        });

        console.log('✅ JWT Strategy initialisiert');
    }

    async validate(payload: any) {
        console.log('🔐 JWT Strategy validate() aufgerufen');
        console.log('📦 Payload:', payload);

        const user = await this.authService.validateUser(payload.sub);

        if (!user) {
            console.log('❌ User nicht gefunden!');
            throw new UnauthorizedException();
        }

        console.log('✅ User validiert:', user.email, user.role);
        return user;
    }
}