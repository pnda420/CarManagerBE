import { Body, Controller, Post, HttpException, HttpStatus } from "@nestjs/common";
import { PageAiService } from "./page-ai.service";
import { GeneratedPagesService } from "../generated-pages/generated-pages.service";

@Controller('page-ai')
export class PageAiController {
    constructor(
        private readonly pageAiService: PageAiService,
        private readonly generatedPagesService: GeneratedPagesService
    ) { }

    @Post('mockup')
    async generateMockup(@Body() body: any) {
        try {
            const formValue = body?.form ?? body;
            if (!formValue || typeof formValue !== 'object') {
                throw new HttpException(
                    'Bad Request: form (JSON) fehlt oder ist ungueltig',
                    HttpStatus.BAD_REQUEST
                );
            }

            // 1. Mockup generieren
            const { content: html, raw } = await this.pageAiService.generateWebsiteMockup(formValue);

            // 2. In Datenbank speichern
            const savedPage = await this.generatedPagesService.create({
                userId: formValue.userId || 'unknown', // Falls userId nicht vorhanden
                name: formValue.projectName || 'Unbenannte Website',
                pageContent: html,
                description: formValue.contentInformation || undefined,
            });

            return {
                ok: true,
                html,
                rawLength: raw?.length ?? 0,
                pageId: savedPage.id, // ID der gespeicherten Page zurückgeben
                savedPage: savedPage // Optional: ganzes Page-Objekt zurückgeben
            };
        } catch (e: any) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                `Mockup-Generierung fehlgeschlagen: ${e?.message || e}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}