// src/newsletter/newsletter.service.ts
import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmailService } from 'src/email/email.service';
import { NewsletterSubscriber } from './newsletter.entity';
import { SubscribeNewsletterDto } from './newsletter.dto';

@Injectable()
export class NewsletterService {
    private readonly logger = new Logger(NewsletterService.name);

    constructor(
        @InjectRepository(NewsletterSubscriber)
        private readonly subscriberRepo: Repository<NewsletterSubscriber>,
        private readonly emailService: EmailService,
    ) { }

    async subscribe(dto: SubscribeNewsletterDto): Promise<NewsletterSubscriber> {
        const existing = await this.subscriberRepo.findOne({
            where: { email: dto.email.toLowerCase() },
        });

        if (existing) {
            if (existing.isActive) {
                throw new ConflictException('Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet');
            }
            existing.isActive = true;
            await this.subscriberRepo.save(existing);
            await this.sendWelcomeEmail(existing.email);
            return existing;
        }

        const subscriber = this.subscriberRepo.create({
            email: dto.email.toLowerCase(),
        });

        const saved = await this.subscriberRepo.save(subscriber);

        await this.sendWelcomeEmail(saved.email);

        this.logger.log(`✅ Neue Newsletter-Anmeldung: ${saved.email}`);

        return saved;
    }

    private async sendWelcomeEmail(email: string): Promise<void> {
        try {
            await this.emailService.sendNewsletterWelcome({
                to: email,
            });
        } catch (error) {
            this.logger.error(`❌ Fehler beim Senden der Willkommens-Email an ${email}:`, error);
        }
    }

    async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
        return this.subscriberRepo.find({
            where: { isActive: true },
            order: { subscribedAt: 'DESC' },
        });
    }

    async unsubscribe(email: string): Promise<void> {
        const subscriber = await this.subscriberRepo.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!subscriber) {
            this.logger.warn(`⚠️ Abmelde-Versuch für nicht existierende Email: ${email}`);
            // Nicht werfen, damit Angreifer nicht testen können welche Emails existieren
            return;
        }

        if (!subscriber.isActive) {
            this.logger.warn(`⚠️ Email bereits abgemeldet: ${email}`);
            return;
        }

        subscriber.isActive = false;
        await this.subscriberRepo.save(subscriber);

        this.logger.log(`📭 Newsletter-Abmeldung: ${email}`);

        // Optional: Bestätigungs-Email senden
        await this.sendUnsubscribeConfirmation(email);
    }

    private async sendUnsubscribeConfirmation(email: string): Promise<void> {
        try {
            await this.emailService.sendNewsletterUnsubscribe({
                to: email,
            });
        } catch (error) {
            this.logger.error(`❌ Fehler beim Senden der Abmelde-Bestätigung an ${email}:`, error);
            // Fehler nicht werfen, Abmeldung ist trotzdem erfolgt
        }
    }

    async getSubscriberCount(): Promise<number> {
        return this.subscriberRepo.count({
            where: { isActive: true },
        });
    }
}