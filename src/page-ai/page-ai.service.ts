import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class PageAiService {
    private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    private static readonly MOCKUP_SYSTEM = [
        '## Rolle & Sprache',
        'Du bist ein Experte für modernes Webdesign. Sprache: Deutsch.',
        '',
        '## Output-Format',
        '- Antworte mit genau EINEM vollständigen HTML-Dokument',
        '- Struktur: <style> im <head>, dann <body> mit <header>, <main>, <footer>',
        '- KEIN Markdown, KEINE ```html Blöcke, KEINE Erklärungen',
        '- Direktes HTML, ready für innerHTML',
        '',
        '## Design-Prinzipien',
        '- **Modern & Professional**: Klare Hierarchie, großzügiger Whitespace, lesbare Typografie',
        '- **Mobile-First**: Perfekt auf Smartphones (320px+), dann Tablets, dann Desktop',
        '- **Farben**: Nutze primaryColor für Highlights/CTAs, secondaryColor für Akzente. Harmonisches Farbschema mit Grautönen',
        '- **Typografie**: System-Fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif), klare Font-Größen (16px base)',
        '- **Spacing**: Konsistentes 8px-Grid (8, 16, 24, 32, 48, 64px)',
        '',
        '## Layout-Anforderungen',
        '- **Header**: Logo links, Navigation rechts (Burger-Menu auf Mobile), sticky optional',
        '- **Main**: Hero-Section, dann 2-4 Content-Sections mit abwechselndem Background',
        '- **Footer**: Kontaktinfos, Links, Copyright - dezent und strukturiert',
        '- **Responsiv**: CSS Grid/Flexbox, mobile-first Media Queries (@media min-width)',
        '',
        '## Inhalt & Bilder',
        '- Nutze reale Platzhalter-Bilder: https://picsum.photos/[width]/[height] (z.B. 800/600 für Hero)',
        '- Icons: Unicode-Emojis oder einfache SVG-Symbole',
        '- Dummy-Text: Aussagekräftig, passend zum Thema (keine Lorem Ipsum)',
        '',
        '## Sicherheit & Funktionalität',
        '- KEINE <script>-Tags, KEINE Inline-Events (onclick, onload, etc.)',
        '- NUR interne Links (href="#section-id" oder href="#")',
        '- KEINE externen Links, Downloads oder Formulare mit action',
        '- Buttons sind rein dekorativ (kein submit, kein JavaScript)',
        '',
        '## Stil-Details',
        '- Box-Shadow für Tiefe: 0 1px 3px rgba(0,0,0,0.1)',
        '- Border-Radius: 8-12px für Karten, 6px für Buttons',
        '- Transitions: 0.2s ease für Hover-Effekte',
        '- Kontrastsichere Texte (WCAG AA mindestens)',
        '- Generiere NUR helle Farbschemata',
        '- KEINE @media (prefers-color-scheme: dark) Regeln',
        '- KEINE .dark-mode oder [data-theme="dark"] Selektoren',
        '- Verwende helle Hintergründe (#ffffff, #f9fafb) und dunkle Texte (#111827)',
    ].join('\n');

    async generateWebsiteMockup(formValue: any): Promise<{ content: string; raw: string }> {
        const prompt = this.buildWebsitePrompt(formValue);

        const resp = await this.client.chat.completions.create({
            model: 'gpt-4o', // oder 'gpt-4o' für beste Qualität
            messages: [
                {
                    role: 'system',
                    content: PageAiService.MOCKUP_SYSTEM
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 16000,
            temperature: 0.7,
        });

        const raw = (resp.choices[0]?.message?.content || '').trim();
        if (!raw) throw new Error('Leere Modell-Antwort');

        const sanitized = this.sanitizeHtml(raw);

        return { content: sanitized, raw };
    }

    private sanitizeHtml(html: string): string {
        // 1. Scripts & Eventhandler entfernen
        let clean = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');

        // 2. Buttons in spans umwandeln (behält Design, entfernt Funktionalität)
        clean = clean.replace(/<button[\s\S]*?<\/button>/gi, (match) => {
            return match
                .replace(/<button/gi, '<span class="btn-disabled"')
                .replace(/<\/button>/gi, '</span>')
                .replace(/type\s*=\s*(['"])[^'"]*\1/gi, '');
        });

        // 3. A-Tags: nur interne Links erlauben
        clean = clean.replace(/<a[\s\S]*?<\/a>/gi, (match) => {
            return match.replace(/href\s*=\s*(['"])(.*?)\1/gi, (m, quote, url) => {
                if (url.startsWith('#') || url === '') {
                    return `href="${url}"`;
                }
                return 'href="#"';
            });
        });

        // 4. Link-Tags (externe CSS) entfernen
        clean = clean.replace(/<link[\s\S]*?>/gi, '');

        // 5. Form actions entfernen
        clean = clean.replace(/<form[\s\S]*?>/gi, (match) => {
            return match.replace(/action\s*=\s*(['"])[^'"]*\1/gi, '');
        });

        // 6. Externe Links komplett entfernen
        clean = clean.replace(/href\s*=\s*(['"])(https?:\/\/[^'"]+)\1/gi, 'href="#"');

        // 7. Target & Rel Attribute entfernen
        clean = clean
            .replace(/\s+target\s*=\s*(['"])[^'"]*\1/gi, '')
            .replace(/\s+rel\s*=\s*(['"])[^'"]*\1/gi, '');

        return clean;
    }

    private buildWebsitePrompt(formValue: any): string {
        const {
            customerType,
            projectName,
            companyName,
            typeOfWebsite,
            primaryColor = '#2563eb',
            secondaryColor = '#10b981',
            designStyle = 'modern',
            contentInformation,
            userId,
            userEmail
        } = formValue;

        return `
# Website-Generierung Auftrag

## Projekt-Details
- **Art**: ${typeOfWebsite} (${this.getWebsiteTypeDescription(typeOfWebsite)})
- **Name**: ${projectName}${companyName ? ` (${companyName})` : ''}
- **Kunde**: ${customerType === 'business' ? 'Unternehmen' : 'Privat/Verein'}
- **Design-Stil**: ${designStyle}

## Farben
- **Primary**: ${primaryColor} (für CTAs, Highlights, wichtige Elemente)
- **Secondary**: ${secondaryColor} (für Akzente, Icons, Hover-States)

## Inhalt & Beschreibung
${contentInformation}

## Spezifische Anforderungen
${this.getWebsiteTypeRequirements(typeOfWebsite)}

## Design-Vorgaben
${this.getDesignStyleGuidelines(designStyle)}

---

**Erstelle jetzt ein vollständiges, produktionsreifes HTML-Mockup.**
- Denke an echte Use Cases: Was will der Besucher sehen?
- Nutze aussagekräftige Überschriften und Texte (kein Lorem Ipsum)
- Füge passende Platzhalter-Bilder ein (picsum.photos)
- Mache es responsive und benutzerfreundlich
- Hero-Section, 3-4 Content-Sections, Footer mit Kontakt-Info
`.trim();
    }

    private getWebsiteTypeDescription(type: string): string {
        const descriptions: Record<string, string> = {
            'praesentation': 'Portfolio, Firmenpräsentation, Showcase',
            'landing': 'Produktseite, Dienstleistung mit CTA',
            'event': 'Veranstaltung, Konferenz, Fest'
        };
        return descriptions[type] || 'Allgemeine Website';
    }

    private getWebsiteTypeRequirements(type: string): string {
        const requirements: Record<string, string> = {
            'praesentation': `
- Hero mit aussagekräftigem Claim
- "Über uns" Section mit Team/Firma-Info
- Portfolio/Leistungen-Grid (3-4 Items)
- Testimonials oder Referenzen
- Kontakt-Section mit Adresse/Email
`,
            'landing': `
- Starke Hero mit klarem Value Proposition
- Features/Vorteile-Liste (3-6 Items)
- Social Proof (Kundenzahlen, Bewertungen)
- Pricing oder CTA-Section (prominent)
- FAQ-Bereich (4-6 häufige Fragen)
`,
            'event': `
- Event-Datum & Location prominent
- Programm/Agenda Timeline
- Speaker/Gäste-Showcase
- Ticket-Infos oder Anmeldung-CTA
- Location-Map oder Wegbeschreibung
`
        };
        return requirements[type] || '- Standard Website-Struktur';
    }

    private getDesignStyleGuidelines(style: string): string {
        const guidelines: Record<string, string> = {
            'modern': 'Minimalistisch, viel Whitespace, klare Linien, Sans-Serif, subtile Schatten',
            'friendly': 'Weiche Formen (border-radius 12-16px), freundliche Farben, einladende Texte',
            'elegant': 'Serif-Fonts, dezente Farben (Schwarz/Gold/Weiß), luxuriöser Look',
            'playful': 'Bunte Akzente, dynamische Formen, kreative Layouts, Emojis/Illustrations'
        };
        return guidelines[style] || 'Modernes, sauberes Design';
    }
}