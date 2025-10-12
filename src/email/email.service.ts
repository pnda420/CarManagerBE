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
        if (!SEND_REAL_EMAILS) {
            this.logger.log('Email would be sent to: ' + JSON.stringify(data));
            return;
        }
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

    async sendWebsiteGenerationComplete(data: {
        userEmail: string;
        userName: string;
        projectName: string;
        websiteId: string;
        typeOfWebsite: string;
    }): Promise<void> {

        if (!SEND_REAL_EMAILS) {
            this.logger.log('Email would be sent to: ' + JSON.stringify(data));
            return;
        }
        const previewUrl = `${this.configService.get<string>('FRONTEND_URL')}/preview/${data.websiteId}`;


        const websiteTypeNames: Record<string, string> = {
            'praesentation': 'Präsentations-Website',
            'landing': 'Landing Page',
            'event': 'Event-Website'
        };

        const websiteTypeName = websiteTypeNames[data.typeOfWebsite] || 'Website';

        const emailParams: EmailParams = {
            to_email: data.userEmail,
            subject: `🎉 Ihre Website "${data.projectName}" ist fertig!`,
            company_name: this.configService.get<string>('COMPANY_NAME', 'LeonardsMedia'),
            greeting: 'Hallo',
            customer_name: data.userName,
            message: `Großartige Neuigkeiten! Ihre ${websiteTypeName} "${data.projectName}" wurde erfolgreich generiert und steht nun zur Vorschau bereit.

Sie können Ihre neue Website jetzt ansehen, testen und bei Bedarf Anpassungen vornehmen. Klicken Sie einfach auf den Button unten, um direkt zur Vorschau zu gelangen.

Wir hoffen, dass das Ergebnis Ihren Erwartungen entspricht. Bei Fragen oder Änderungswünschen stehen wir Ihnen gerne zur Verfügung.`,
            highlight_message: '✨ Ihre Website ist jetzt online und bereit zur Ansicht!',
            button_url: previewUrl,
            button_text: 'Website-Vorschau öffnen',
            company_email: this.configService.get<string>('COMPANY_EMAIL'),
            company_website: this.configService.get<string>('COMPANY_WEBSITE'),
            footer_note: 'Sie können die Vorschau jederzeit über Ihr Dashboard aufrufen.',
        };

        await this.sendEmail(emailParams);
    }

    // email.service.ts (Ergänzung in der Klasse EmailService)

    async sendWebsiteReadyEmail(data: {
        to: string;
        projectName: string;
        pageId: string;
        previewUrl: string;
    }): Promise<void> {
        if (!SEND_REAL_EMAILS) {
            this.logger.log('📧 [MOCK] Website Ready Email würde gesendet werden:');
            this.logger.log(`   An: ${data.to}`);
            this.logger.log(`   Projekt: ${data.projectName}`);
            this.logger.log(`   Page ID: ${data.pageId}`);
            this.logger.log(`   Preview URL: ${data.previewUrl}`);
            return;
        }

        const emailParams: EmailParams = {
            to_email: data.to,
            subject: `🎉 Deine Website "${data.projectName}" ist fertig!`,
            company_name: this.configService.get<string>('COMPANY_NAME', 'LeonardsMedia'),
            greeting: 'Hey',
            customer_name: '', // optional: aus Email extrahieren
            message: `Großartige Neuigkeiten! Dein Website-Projekt "${data.projectName}" wurde erfolgreich mit KI generiert und ist jetzt bereit zur Vorschau.

Die KI hat eine moderne, einzigartige Website basierend auf deinen Vorgaben erstellt. Du kannst sie jetzt ansehen, testen und bei Bedarf weitere Anpassungen vornehmen.

Klicke einfach auf den Button unten, um direkt zur Vorschau zu gelangen und deine neue Website zu erleben!`,
            highlight_message: '✨ Deine Website ist fertig und wartet auf dich!',
            button_url: data.previewUrl,
            button_text: '🚀 Website jetzt ansehen',
            company_email: this.configService.get<string>('COMPANY_EMAIL'),
            company_website: this.configService.get<string>('COMPANY_WEBSITE'),
            footer_note: 'Du kannst die Vorschau jederzeit über dein Dashboard aufrufen.',
        };

        await this.sendEmail(emailParams);
    }

    async sendWebsiteErrorEmail(data: {
        to: string;
        projectName: string;
        error: string;
    }): Promise<void> {
        if (!SEND_REAL_EMAILS) {
            this.logger.log('📧 [MOCK] Website Error Email würde gesendet werden:');
            this.logger.log(`   An: ${data.to}`);
            this.logger.log(`   Projekt: ${data.projectName}`);
            this.logger.log(`   Fehler: ${data.error}`);
            return;
        }

        const retryUrl = `${this.configService.get<string>('FRONTEND_URL')}/preview-form`;

        const emailParams: EmailParams = {
            to_email: data.to,
            subject: `⚠️ Problem bei der Erstellung von "${data.projectName}"`,
            company_name: this.configService.get<string>('COMPANY_NAME', 'LeonardsMedia'),
            greeting: 'Hallo',
            customer_name: '',
            message: `Leider ist bei der Generierung deiner Website "${data.projectName}" ein Problem aufgetreten.

Fehlerdetails: ${data.error}

Das kann verschiedene Gründe haben:
• Temporäre technische Schwierigkeiten
• Ungewöhnliche Eingabedaten
• Überlastung des KI-Systems

Wir empfehlen dir:
1. Versuche es in ein paar Minuten erneut
2. Überprüfe deine Eingaben
3. Kontaktiere uns bei wiederholten Problemen

Wir entschuldigen uns für die Unannehmlichkeiten und helfen dir gerne weiter!`,
            highlight_message: '🔧 Keine Sorge – versuch es einfach nochmal oder kontaktiere uns!',
            button_url: retryUrl,
            button_text: 'Erneut versuchen',
            company_email: this.configService.get<string>('COMPANY_EMAIL'),
            company_website: this.configService.get<string>('COMPANY_WEBSITE'),
            footer_note: 'Bei Fragen stehen wir dir jederzeit zur Verfügung.',
        };

        await this.sendEmail(emailParams);
    }


}