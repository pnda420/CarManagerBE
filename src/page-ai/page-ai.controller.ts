import { Controller, Post, Body, Query, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { PageAiService } from './page-ai.service';
import { GeneratedPagesService } from 'src/generated-pages/generated-pages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailService } from 'src/email/email.service';


type Quality = 'fast' | 'balanced' | 'premium';

function isValidQuality(q: any): q is Quality {
    return ['fast', 'balanced', 'premium'].includes(q);
}

function isValidEmail(email: string): boolean {
    // simple RFC5322-lite
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


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
        @Query('quality') quality: Quality = 'balanced',
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


    @Post('mockup-public')
    async generateMockupPublic(
        @Body('form') formData: any,
        @Query('quality') quality: Quality = 'balanced',
        @Req() req: any
    ) {
        if (!isValidQuality(quality)) {
            throw new BadRequestException('Quality must be: fast, balanced, or premium');
        }

        const targetEmail: string | null = formData?.email ?? null;
        if (!targetEmail || !isValidEmail(targetEmail)) {
            throw new BadRequestException('Bitte eine gültige E-Mail-Adresse angeben.');
        }

        // Optional: minimale Pflichtfelder prüfen, damit Generierung sinnvolle Inputs hat
        if (!formData?.projectName || !formData?.typeOfWebsite || !formData?.contentInformation) {
            throw new BadRequestException('Bitte Projektname, Art der Website und die Beschreibung ausfüllen.');
        }

        // Hier KEIN userId – public
        const userId: string | null = null;

        console.log(`📝 (public) Website-Generierung: ${formData?.projectName} (${quality})`);

        // Fire & Forget
        this.processGenerationInBackground(formData, quality, userId, targetEmail, req);

        return {
            ok: true,
            status: 'processing',
            message: 'Website wird generiert. Wir schicken dir den Link per E-Mail, sobald die Generierung abgeschlossen ist.',
            estimatedTime: this.getEstimatedTime(quality),
            metadata: {
                quality,
                projectName: formData?.projectName,
                websiteType: formData?.typeOfWebsite,
                startedAt: new Date().toISOString()
            }
        };
    }


    // ✅ Background Processing (läuft unabhängig vom Client)
    private async processGenerationInBackground(
        formData: any,
        quality: Quality,
        userId: string | null,
        targetEmail: string,
        req?: any
    ): Promise<void> {
        try {
            const requesterIp = req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown';
            console.log(`🚀 Background: Generiere ${formData?.projectName}... (ip: ${requesterIp})`);

            // 1) Generieren
            const result = await this.pageAiService.generateWebsiteMockup(formData, quality);
            console.log(`✅ Background: Generierung abgeschlossen`);

            // 2) Speichern (userId kann NULL sein; zusätzlich contactEmail ablegen)
            const savedPage = await this.generatedPagesService.create({
                userId: userId ?? null,
                name: formData?.projectName,
                pageContent: result.content,
                description: String(formData?.contentInformation || '').substring(0, 200),
                contactEmail: targetEmail,          // 👈 neu
                requesterIp: String(requesterIp),   // 👈 optional, falls in Entity
                quality
            } as any);

            console.log(`💾 Background: Page gespeichert mit ID: ${savedPage.id}`);

            // 3) Erfolgsmail
            await this.emailService.sendWebsiteReadyEmail({
                to: targetEmail,
                projectName: formData?.projectName,
                pageId: savedPage.id,
                previewUrl: `${process.env.FRONTEND_URL}/preview?id=${savedPage.id}`
            });

            console.log(`📧 Background: Email gesendet an ${targetEmail}`);

        } catch (error) {
            console.error('❌ Background: Fehler bei Generierung:', error);
            try {
                await this.emailService.sendWebsiteErrorEmail({
                    to: targetEmail,
                    projectName: formData?.projectName,
                    error: error?.message ?? 'Unbekannter Fehler'
                });
            } catch (emailError) {
                console.error('❌ Background: Email-Fehler:', emailError);
            }
        }
    }

    private getEstimatedTime(quality: Quality): string {
        const times: Record<Quality, string> = {
            fast: '15-20 Sekunden',
            balanced: '30-45 Sekunden',
            premium: '60-90 Sekunden'
        };
        return times[quality] || '30-45 Sekunden';
    }

}