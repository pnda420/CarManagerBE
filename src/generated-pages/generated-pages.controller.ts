import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards
} from '@nestjs/common';
import { GeneratedPagesService } from './generated-pages.service';
import { CreateGeneratedPageDto, UpdateGeneratedPageDto } from './generated-pages.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';


@Controller('generated-pages')
export class GeneratedPagesController {
    constructor(private readonly pagesService: GeneratedPagesService) { }

    // Neue Page erstellen
    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateGeneratedPageDto) {
        return this.pagesService.create(dto);
    }

    // Alle Pages eines Users
    @UseGuards(JwtAuthGuard)
    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        return this.pagesService.findByUser(userId);
    }

    // Anzahl Pages eines Users
    @UseGuards(JwtAuthGuard)
    @Get('user/:userId/count')
    async countByUser(@Param('userId') userId: string) {
        const count = await this.pagesService.countByUser(userId);
        return { count };
    }

    // Alle veröffentlichten Pages (öffentlich zugänglich)
    @Get('published')
    async findPublished() {
        return this.pagesService.findPublished();
    }

    // Admin Route: Alle Pages
      @UseGuards(JwtAuthGuard, AdminGuard)
    @Get()
    async findAll() {
        return this.pagesService.findAll();
    }

    // Einzelne Page abrufen
    // Optional: userId als Query Parameter für Auth-Check
    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Query('userId') userId?: string
    ) {
        return this.pagesService.findOne(id, userId);
    }

    // Page aktualisieren
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateGeneratedPageDto,
        @Query('userId') userId?: string
    ) {
        return this.pagesService.update(id, dto, userId);
    }

    // Page löschen
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id') id: string,
        @Query('userId') userId?: string
    ) {
        return this.pagesService.delete(id, userId);
    }
}