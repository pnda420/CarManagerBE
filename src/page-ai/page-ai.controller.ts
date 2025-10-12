import { Controller, Post, Body, Query, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { PageAiService } from './page-ai.service';
import { GeneratedPagesService } from 'src/generated-pages/generated-pages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailService } from 'src/email/email.service';

@Controller('page-ai')
export class PageAiController {
    constructor(
        private readonly pageAiService: PageAiService,
        private readonly generatedPagesService: GeneratedPagesService,
        private readonly emailService: EmailService
    ) { }

    @Post('mockup')
    @UseGuards(JwtAuthGuard)
    async generateMockup(
        @Body('form') formData: any,
        @Query('quality') quality: 'fast' | 'balanced' | 'premium' = 'balanced',
        @Req() req: any
    ) {
        if (!['fast', 'balanced', 'premium'].includes(quality)) {
            throw new BadRequestException('Quality must be: fast, balanced, or premium');
        }

        const userId = req.user.id;
        const userEmail = req.user.email;

        console.log(`📝 Website-Generierung: ${formData.projectName} (${quality})`);

        // ✅ Starte Generierung im Hintergrund (Fire & Forget)
        this.processGenerationInBackground(formData, quality, userId, userEmail);

        // ✅ Sofortige Response zurückgeben
        return {
            ok: true,
            status: 'processing',
            message: 'Website wird generiert. Du erhältst eine Email wenn fertig.',
            estimatedTime: this.getEstimatedTime(quality),
            metadata: {
                quality,
                projectName: formData.projectName,
                websiteType: formData.typeOfWebsite,
                startedAt: new Date().toISOString()
            }
        };
    }

    // ✅ Background Processing (läuft unabhängig vom Client)
    private async processGenerationInBackground(
        formData: any,
        quality: 'fast' | 'balanced' | 'premium',
        userId: string,
        userEmail: string
    ): Promise<void> {
        try {
            console.log(`🚀 Background: Generiere ${formData.projectName}...`);

            // Website generieren (läuft async im Background)
            const result = await this.pageAiService.generateWebsiteMockup(formData, quality);

            console.log(`✅ Background: Generierung abgeschlossen`);

            // In DB speichern
            const savedPage = await this.generatedPagesService.create({
                userId,
                name: formData.projectName,
                pageContent: result.content,
                description: formData.contentInformation.substring(0, 200),
            });

            console.log(`💾 Background: Page gespeichert mit ID: ${savedPage.id}`);

            // ✅ Success Email senden
            await this.emailService.sendWebsiteReadyEmail({
                to: userEmail,
                projectName: formData.projectName,
                pageId: savedPage.id,
                previewUrl: `${process.env.FRONTEND_URL}/preview?id=${savedPage.id}`
            });

            console.log(`📧 Background: Email gesendet an ${userEmail}`);

        } catch (error) {
            console.error('❌ Background: Fehler bei Generierung:', error);

            // ✅ Error Email senden
            try {
                await this.emailService.sendWebsiteErrorEmail({
                    to: userEmail,
                    projectName: formData.projectName,
                    error: error?.message ?? 'Unbekannter Fehler'
                });
            } catch (emailError) {
                console.error('❌ Background: Email-Fehler:', emailError);
            }
        }
    }

    private getEstimatedTime(quality: string): string {
        const times = {
            fast: '15-20 Sekunden',
            balanced: '30-45 Sekunden',
            premium: '60-90 Sekunden'
        };
        return times[quality] || '30-45 Sekunden';
    }
}