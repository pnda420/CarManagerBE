// src/newsletter/newsletter.controller.ts
import { Controller, Post, Body, Get, UseGuards, Delete, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './newsletter.dto';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    // PUBLIC: Newsletter abonnieren
    @Post('subscribe')
    async subscribe(@Body() dto: SubscribeNewsletterDto) {
        const subscriber = await this.newsletterService.subscribe(dto);
        return {
            success: true,
            message: 'Erfolgreich für den Newsletter angemeldet! Check deine E-Mails.',
            email: subscriber.email,
        };
    }

    // PUBLIC: Newsletter abbestellen
    @Delete('unsubscribe')
    async unsubscribe(@Query('email') email: string) {
        if (!email) {
            return {
                success: false,
                message: 'E-Mail-Adresse fehlt',
            };
        }

        await this.newsletterService.unsubscribe(email);
        return {
            success: true,
            message: 'Erfolgreich vom Newsletter abgemeldet',
        };
    }

    // ADMIN: Alle Subscriber abrufen
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('subscribers')
    async getAllSubscribers() {
        const subscribers = await this.newsletterService.getAllSubscribers();
        const count = await this.newsletterService.getSubscriberCount();
        return {
            count,
            subscribers,
        };
    }
}