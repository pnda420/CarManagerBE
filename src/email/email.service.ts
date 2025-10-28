import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import emailjs from '@emailjs/nodejs';

// Toggle hier: true = wirklich senden, false = nur console.log
const SEND_REAL_EMAILS = true;

interface EmailParams extends Record<string, unknown> {
    to_email: string;
    subject: string;
    greeting: string;
    customer_name: string;
    message: string;
    button_url?: string;
    button_text?: string;
    footer_note?: string;
}

interface CarAlertEmailParams {
    to_email: string;
    subject: string;
    customer_name: string;
    car_name: string;
    alert_message: string;
    car_details: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly serviceId: string;
    private readonly templateId: string;
    private readonly publicKey: string;
    private readonly privateKey: string;

    constructor(private configService: ConfigService) {
        this.serviceId = this.configService.get<string>('EMAILJS_SERVICE_ID');
        this.templateId = this.configService.get<string>('EMAILJS_TEMPLATE_ID');
        this.publicKey = this.configService.get<string>('EMAILJS_PUBLIC_KEY');
        this.privateKey = this.configService.get<string>('EMAILJS_PRIVATE_KEY');


        if (!SEND_REAL_EMAILS) {
            this.logger.warn('⚠️  EMAIL SERVICE IM MOCK MODE - Emails werden nur geloggt!');
        }
    }

    formatTimeFromHHMMSStoHHMM(time: string): string {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    }

    async sendEmail(params: EmailParams): Promise<void> {
        if (!SEND_REAL_EMAILS) {
            // Nur Console-Logging
            this.logger.log('📧 [MOCK] Email würde gesendet werden:');
            this.logger.log(`   An: ${params.to_email}`);
            this.logger.log(`   Betreff: ${params.subject}`);
            this.logger.log(`   Kunde: ${params.customer_name}`);
            this.logger.log(`   Nachricht: ${params.message}`);
            if (params.button_url) {
                this.logger.log(`   Button: ${params.button_text} -> ${params.button_url}`);
            }
            this.logger.log(`   Template: ${this.templateId}`);
            return;
        }

        // Echtes Senden via EmailJS
        try {
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                params,
                {
                    publicKey: this.publicKey,
                    privateKey: this.privateKey,
                }
            );

            this.logger.log(`✅ Email erfolgreich gesendet: ${response.status} ${response.text}`);
        } catch (error) {
            this.logger.error('❌ Fehler beim Email-Versand:', error);
            throw new Error(`Email konnte nicht gesendet werden: ${error.message}`);
        }
    }

    async sendCarAlert(params: EmailParams): Promise<void> {
        if (!SEND_REAL_EMAILS) {
            this.logger.log('📧 [MOCK] Car Alert Email würde gesendet werden:');
            this.logger.log(`   An: ${params.to_email}`);
            this.logger.log(`   Betreff: ${params.subject}`);
            this.logger.log(`   Kunde: ${params.customer_name}`);
            this.logger.log(`   Fahrzeug: ${params.car_name}`);
            this.logger.log(`   Alert: ${params.alert_message}`);
            this.logger.log(`   Details: ${params.car_details}`);
            return;
        }

        try {
            const emailParams = {
                to_email: params.to_email,
                subject: params.subject,
                customer_name: params.customer_name,
                car_name: params.car_name,
                alert_message: params.alert_message,
                car_details: params.car_details,
                greeting: `Hallo ${params.customer_name}`,
                footer_note: 'Du kannst deine Benachrichtigungseinstellungen jederzeit in deinem Profil ändern.',
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                emailParams,
                {
                    publicKey: this.publicKey,
                    privateKey: this.privateKey,
                }
            );

            this.logger.log(`✅ Car Alert Email erfolgreich gesendet: ${response.status}`);
        } catch (error) {
            this.logger.error('❌ Fehler beim Car Alert Email-Versand:', error);
            throw new Error(`Car Alert Email konnte nicht gesendet werden: ${error.message}`);
        }
    }




}