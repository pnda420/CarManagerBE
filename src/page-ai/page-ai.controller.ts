import { Controller, Post, Body, Query, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { IsString, IsEmail, IsOptional, IsIn, IsNotEmpty, MinLength } from 'class-validator';
import { PageAiService } from './page-ai.service';
import { GeneratedPagesService } from 'src/generated-pages/generated-pages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

export class GeneratePageDto {
    @IsIn(['business', 'private'])
    customerType: 'business' | 'private';

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    projectName: string;

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsIn(['praesentation', 'landing', 'event'])
    typeOfWebsite: 'praesentation' | 'landing' | 'event';

    @IsString()
    @IsOptional()
    primaryColor?: string;

    @IsString()
    @IsOptional()
    secondaryColor?: string;

    @IsIn(['modern', 'friendly', 'elegant', 'playful'])
    @IsOptional()
    designStyle?: 'modern' | 'friendly' | 'elegant' | 'playful';

    @IsString()
    @IsNotEmpty()
    @MinLength(30)
    contentInformation: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsEmail()
    @IsOptional()
    userEmail?: string;

    @IsString()
    @IsOptional()
    generatedAt?: string;
}

@Controller('page-ai')
export class PageAiController {
    constructor(
        private readonly pageAiService: PageAiService,
        private readonly generatedPagesService: GeneratedPagesService // ✅ Inject
    ) { }
    
    @Post('mockup')
    @UseGuards(JwtAuthGuard) // ✅ Nur für eingeloggte User
    async generateMockup(
        @Body('form') formData: GeneratePageDto,
        @Query('quality') quality: 'fast' | 'balanced' | 'premium' = 'balanced',
        @Req() req: any // ✅ User aus JWT
    ) {
        if (!['fast', 'balanced', 'premium'].includes(quality)) {
            throw new BadRequestException('Quality must be: fast, balanced, or premium');
        }

        try {
            console.log(`📝 Website-Generierung: ${formData.projectName} (${quality})`);

            // 1. Website generieren
            const result = await this.pageAiService.generateWebsiteMockup(formData, quality);

            // 2. ✅ IN DATENBANK SPEICHERN
            const savedPage = await this.generatedPagesService.create({
                userId: req.user.id, // Aus JWT
                name: formData.projectName,
                pageContent: result.content,
                description: formData.contentInformation.substring(0, 200), // Erste 200 Zeichen
            });

            console.log(`✅ Page gespeichert mit ID: ${savedPage.id}`);

            return {
                ok: true,
                html: result.content,
                rawLength: result.raw.length,
                pageId: savedPage.id, // ✅ ID zurückgeben
                savedPage: savedPage, // ✅ Komplettes Objekt
                metadata: {
                    quality,
                    tokensUsed: result.tokensUsed,
                    model: 'gpt-5',
                    generatedAt: new Date().toISOString(),
                    projectName: formData.projectName,
                    websiteType: formData.typeOfWebsite
                }
            };
        } catch (error) {
            console.error('❌ Fehler bei Website-Generierung:', error);

            throw new BadRequestException({
                ok: false,
                error: error.message || 'Fehler bei der Website-Generierung',
                timestamp: new Date().toISOString()
            });
        }
    }
}