import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGeneratedPageDto, UpdateGeneratedPageDto } from './generated-pages.dto';
import { GeneratedPage } from './generated-pages.entity';

@Injectable()
export class GeneratedPagesService {
    constructor(
        @InjectRepository(GeneratedPage)
        private readonly pageRepo: Repository<GeneratedPage>,
    ) { }

    async create(dto: CreateGeneratedPageDto): Promise<GeneratedPage> {
        const page = this.pageRepo.create(dto);
        return this.pageRepo.save(page);
    }

    async findAll(): Promise<GeneratedPage[]> {
        return this.pageRepo.find({
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
    }

    async findByUser(userId: string): Promise<GeneratedPage[]> {
        return this.pageRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, userId?: string): Promise<GeneratedPage> {
        const page = await this.pageRepo.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!page) {
            throw new NotFoundException(`Generated page with ID ${id} not found`);
        }

        // Optional: Prüfe ob User berechtigt ist, diese Page zu sehen
        if (userId && page.userId !== userId) {
            throw new ForbiddenException('You are not authorized to access this page');
        }

        return page;
    }

    async update(id: string, dto: UpdateGeneratedPageDto, userId?: string): Promise<GeneratedPage> {
        const page = await this.findOne(id);

        // Optional: Prüfe ob User berechtigt ist, diese Page zu ändern
        if (userId && page.userId !== userId) {
            throw new ForbiddenException('You are not authorized to update this page');
        }

        Object.assign(page, dto);
        return this.pageRepo.save(page);
    }

    async delete(id: string, userId?: string): Promise<void> {
        const page = await this.findOne(id);

        // Optional: Prüfe ob User berechtigt ist, diese Page zu löschen
        if (userId && page.userId !== userId) {
            throw new ForbiddenException('You are not authorized to delete this page');
        }

        await this.pageRepo.delete(id);
    }

    async countByUser(userId: string): Promise<number> {
        return this.pageRepo.count({ where: { userId } });
    }

    async findPublished(): Promise<GeneratedPage[]> {
        return this.pageRepo.find({
            where: { isPublished: true },
            order: { createdAt: 'DESC' },
        });
    }
}