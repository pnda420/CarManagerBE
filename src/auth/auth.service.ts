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
  console.log('📝 Empfangenes Passwort:', password ? `${password.length} Zeichen` : 'UNDEFINED/NULL');
  
  // Validierung
  if (!email || !password) {
    console.log('❌ E-Mail oder Passwort fehlt');
    throw new UnauthorizedException('Email and password are required');
  }
  
  const user = await this.usersService.findByEmail(email);
  
  if (!user) {
    console.log('❌ User nicht gefunden');
    throw new UnauthorizedException('Invalid credentials');
  }

  console.log('👤 User gefunden:', user.email);
  console.log('🔒 User.password vorhanden:', !!user.password);
  console.log('🔒 User.password Länge:', user.password?.length);
  console.log('🔒 User.password Anfang:', user.password?.substring(0, 10));

  // WICHTIG: Prüfen ob user.password existiert
  if (!user.password) {
    console.log('❌ User hat kein Passwort in DB');
    throw new UnauthorizedException('Invalid credentials');
  }

  console.log('🔍 Vergleiche Passwörter...');
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    console.log('❌ Passwort falsch');
    throw new UnauthorizedException('Invalid credentials');
  }

  console.log('✅ Passwort korrekt');

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };

  const access_token = this.jwtService.sign(payload);
  
  console.log('✅ Token erstellt für User:', user.id);

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
  console.log('📝 Registrierung für:', email);
  
  // Passwort hashen
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // User erstellen
  const user = await this.usersService.create({
    email,
    name,
    password: hashedPassword,
  });

  console.log('✅ User erstellt:', user.id);

  // Token direkt erstellen (NICHT login() aufrufen!)
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };

  const access_token = this.jwtService.sign(payload);
  
  console.log('✅ Token erstellt für neuen User:', user.id);

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
}