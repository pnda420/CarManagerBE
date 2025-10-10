import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import emailjs from '@emailjs/nodejs';

// Toggle hier: true = wirklich senden, false = nur console.log
const SEND_REAL_EMAILS = true;

interface EmailParams extends Record<string, unknown> {
    to_email: string;
    subject: string;
    company_name: string;
    greeting: string;
    customer_name: string;
    message: string;
    highlight_message?: string;
    button_url?: string;
    button_text?: string;
    company_email: string;
    company_website: string;
    footer_note?: string;
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

    async sendEmail(params: EmailParams): Promise<void> {
        if (!SEND_REAL_EMAILS) {
            // Nur Console-Logging
            this.logger.log('📧 [MOCK] Email würde gesendet werden:');
            this.logger.log(`   An: ${params.to_email}`);
            this.logger.log(`   Betreff: ${params.subject}`);
            this.logger.log(`   Kunde: ${params.customer_name}`);
            this.logger.log(`   Firma: ${params.company_name}`);
            this.logger.log(`   Nachricht: ${params.message}`);
            if (params.highlight_message) {
                this.logger.log(`   Highlight: ${params.highlight_message}`);
            }
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


    async sendContactRequestConfirmation(data: {
        userEmail: string;
        userName: string;
        serviceType: string;
    }): Promise<void> {
        const emailParams: EmailParams = {
            to_email: data.userEmail,
            subject: 'Vielen Dank für Ihre Anfrage!',
            company_name: this.configService.get<string>('COMPANY_NAME', 'LeonardsMedia'),
            greeting: 'Hallo',
            customer_name: data.userName,
            message: `Vielen Dank für Ihre Anfrage zu unserem Service "${data.serviceType}". 
    
    Wir haben Ihre Nachricht erhalten und freuen uns über Ihr Interesse. Unser Team wird Ihre Anfrage prüfen und sich schnellstmöglich bei Ihnen melden.
    
    In der Zwischenzeit können Sie gerne unsere Website besuchen oder uns direkt kontaktieren, falls Sie weitere Fragen haben.`,
            highlight_message: '🎉 Wir melden uns innerhalb von 24 Stunden bei Ihnen!',
            button_url: this.configService.get<string>('COMPANY_WEBSITE'),
            button_text: 'Zur Website',
            company_email: this.configService.get<string>('COMPANY_EMAIL'),
            company_website: this.configService.get<string>('COMPANY_WEBSITE'),
            footer_note: 'Bei Rückfragen stehen wir Ihnen jederzeit zur Verfügung.',
        };

        await this.sendEmail(emailParams);
    }

}