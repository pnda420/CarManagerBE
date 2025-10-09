import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, User } from 'src/users/users.entity';


export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

export interface LoginResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
    };
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(email: string, name: string, password: string): Promise<LoginResponse> {
        const existing = await this.userRepo.findOne({ where: { email } });
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepo.create({
            email,
            name,
            password: hashedPassword,
            role: UserRole.USER,
        });

        const savedUser = await this.userRepo.save(user);
        return this.generateToken(savedUser);
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateToken(user);
    }

    async validateUser(userId: string): Promise<User | null> {
        return this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'email', 'name', 'role', 'wantsNewsletter', 'isVerified', 'createdAt']
        });
    }

    // In auth.service.ts - generateToken()
    private generateToken(user: User): LoginResponse {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        console.log('🎫 Generiere neuen Token mit Secret:', process.env.JWT_SECRET);
        console.log('📦 Payload:', payload);

        const token = this.jwtService.sign(payload);
        console.log('✅ Token erstellt:', token.substring(0, 50) + '...');

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}