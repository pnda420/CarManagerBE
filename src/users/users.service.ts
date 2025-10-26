import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';
import { CreateUserDto, LoginDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async create(dto: CreateUserDto): Promise<User> {
        // Prüfe ob Email bereits existiert
        const existingUser = await this.userRepo.findOne({
            where: { email: dto.email }
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // WICHTIG: Passwort wird bereits im AuthService gehasht
        // Hier NICHT nochmal hashen!
        const user = this.userRepo.create(dto);

        const savedUser = await this.userRepo.save(user);

        // Passwort aus Response entfernen
        delete savedUser.password;
        return savedUser;
    }

    async findAll(): Promise<User[]> {
        const users = await this.userRepo.find({
            order: { createdAt: 'DESC' },
            select: ['id', 'email', 'name', 'role', 'isVerified', 'createdAt', 'updatedAt'], // Doppeltes Komma entfernt
        });
        return users;
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { id },
            select: ['id', 'email', 'name', 'role', 'isVerified', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    // ✅ HIER IST DIE LÖSUNG: Passwort explizit mit laden
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password') // ← Passwort explizit laden
            .getOne();
    }

    async update(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Wenn Passwort geändert wird, hashen
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        Object.assign(user, dto);
        const updated = await this.userRepo.save(user);
        delete updated.password;
        return updated;
    }

    async delete(id: string): Promise<void> {
        const result = await this.userRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    // Diese Methoden werden nicht mehr gebraucht (AuthService übernimmt das)
    // Aber lasse sie zur Kompatibilität drin
    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.findByEmail(email); // Nutzt jetzt die korrigierte Methode

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        delete user.password;
        return user;
    }

    async login(dto: LoginDto): Promise<User> {
        return this.validateUser(dto.email, dto.password);
    }

    async count(): Promise<number> {
        return this.userRepo.count();
    }
}