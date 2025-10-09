import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class PageAiService {
    constructor() { }


    private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    private static readonly MOCKUP_SYSTEM = [
        'Sprache: Deutsch.',
        'Antworte mit genau EINEM HTML-Snippet.',
        'Nur <style> und HTML innerhalb des Snippets. KEIN Markdown, KEINE Skripte.',
        'Responsiv, professionell, modern, sauber.',
        'Nutze nur relative/anker Links (href="#..."). Keine externen Domains/Downloads.',
        'Struktur: <header> <main> <footer> (in dieser Reihenfolge).',
        'Wenn kein Bild angegeben: nutze geeignete Stock-Platzhalter-Bilder (z.B. via picsum.photos) – aber nur http(s) Bild-URLs, keine iframes.',
        'Farben: halte Dich an primaryColor und secondaryColor.',
        'Kein Tracking, keine Inline-Eventhandler (on*) und keine <script>-Tags.',
    ].join(' ');

    async generateWebsiteMockup(formValue: any): Promise<{ content: string; raw: string }> {
        const prompt = this.buildWebsitePrompt(formValue);

        const resp = await this.client.responses.create({
            model: 'gpt-5-mini',
            instructions: PageAiService.MOCKUP_SYSTEM,
            input: prompt,
            max_output_tokens: 16500,
            reasoning: { effort: 'low' },
        });

        const raw = (this.parseOpenAIResponse(resp) || '').trim();
        if (!raw) throw new Error('Leere Modell-Antwort');

        // 1) Scripts & Eventhandler hart entfernen
        let sanitized = raw
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, ''); // onclick etc. entfernen


        //Alle button funktionalitäten entfernen
        sanitized = sanitized.replace(/<button[\s\S]*?<\/button>/gi, '');

        //Alle a-tag links entfernen
        sanitized = sanitized.replace(/<a[\s\S]*?<\/a>/gi, (match) => {
            return match.replace(/href\s*=\s*(['"])(.*?)\1/gi, 'href="#"');
        });

        //Alle Links entfernen
        sanitized = sanitized.replace(/<link[\s\S]*?>/gi, '');

        // 2) Externe Links raus
        sanitized = sanitized.replace(/href\s*=\s*(['"])(https?:\/\/[^'"]+)\1/gi, 'href="#"');

        // 3) target/_blank und rel weg
        sanitized = sanitized
            .replace(/\s+target\s*=\s*(['"])[^'"]*\1/gi, '')
            .replace(/\s+rel\s*=\s*(['"])[^'"]*\1/gi, '');

        // -> nichts splitten, einfach als Ganzes zurück
        return { content: sanitized, raw };
    }

    private parseOpenAIResponse(resp: any): string {
        const text = resp?.output_text?.trim?.();
        if (text) return text;
        try {
            const fromOutput = (resp?.output ?? [])
                .flatMap((item: any) => item?.content ?? [])
                .map((c: any) => (typeof c?.text === 'string' ? c.text : ''))
                .join('')
                .trim();
            if (fromOutput) return fromOutput;
        } catch { }
        return '';
    }


    private buildWebsitePrompt(formValue: any): string {
        const json = JSON.stringify(formValue);
        return `
    Erstelle einen Website Mockup basierend auf den folgenden Informationen.
    Ich moechte es als InnerHTML verwenden.
    Bitte antworte nur mit dem HTML und den Styles innerhalb von diesem.
    Keine Markdown-Syntax. Die Response soll 1:1 in innerHTML nutzbar sein.
    Mach sie professionell, modern, clean und sehr responsiv (Mobil besonders).
    Benutze die mitgegebenen Farben (primaryColor, secondaryColor).
    Benutze keine hrefs, die aus der Seite raus fuehren (nur "#", "#id" usw.).
    Wenn ein bild als logo mitgegeben ist, benutze es.
    Wenn kein Bild als logo mitgegeben ist, benutze ein passendes Stockfoto (z.B. via picsum.photos).
    Wenn Locations mitgegeben sind, benutze sie fuer eine Karte (z.B. via openstreetmap.org).
    Nutze die Struktur: Header, Main, Footer.
    SUPER WICHTIG: BUTTONS A-TAGS USW DÜRFEN KEINE EXTERNEN LINKS SEIN.
    ES DARF KEINE MÖGLICHKEIT GEBEN, DIE SEITE ZU VERLASSEN.
    BUTTONS UND KLICKBARE ELEMENTE DÜRFEN NIEMALS FUNKTIONIEREN.
    ALLES MOCKUP, KEINE FUNKTIONALITÄT.
    Hier sind die Benutzerspezifischen Informationen (JSON):
    ${json}
    `;
    }
}