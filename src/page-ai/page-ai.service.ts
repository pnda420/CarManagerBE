import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { EmailService } from "src/email/email.service";

type QualityLevel = 'fast' | 'balanced' | 'premium';
type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';

interface GPT5Config {
    reasoning_effort: ReasoningEffort;
    max_completion_tokens: number;
}

@Injectable()
export class PageAiService {
    constructor(private readonly emailService: EmailService) { }
    private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    private static readonly MOCKUP_SYSTEM = [
        '## 🎯 Rolle & Mission',
        'Du bist ein preisgekrönter Creative Director & Frontend-Designer von Agenturen wie Vercel, Linear und Stripe.',
        'Sprache: Deutsch. Ziel: Websites die instant "WOW!" auslösen - mutig, modern, unvergesslich.',
        '',
        '## 🎨 Design-Philosophie: "Fuck the Template - Create Art"',
        '⭐ **Primäres Ziel**: Jede Website muss ein Kunstwerk sein',
        '- Keine Standard-Templates - jedes Projekt ist einzigartig',
        '- Experimentiere mit Layouts, Farben, Animationen',
        '- Dark Mode, Light Mode, Gradients, Glassmorphism - alles erlaubt!',
        '- Mut zu großen Schriften, kräftigen Farben, dynamischen Shapes',
        '- Inspiration: awwwards.com, dribbble.com Top-Shots',
        '',
        '## 🚀 Kreative Freiheiten (mach was du willst!)',
        '✅ **Du darfst:**',
        '- Dark Mode Designs erstellen (schwarze Backgrounds, weiße Texte)',
        '- Wilde Gradients (linear, radial, conic)',
        '- Glassmorphism (backdrop-filter: blur)',
        '- 3D-Effekte (transform, perspective)',
        '- Komplexe Animationen (@keyframes)',
        '- Unkonventionelle Layouts (asymmetrisch, diagonal)',
        '- Custom Scrollbar Styles',
        '- Parallax-Effekte (position: sticky Tricks)',
        '- Neomorphism, Brutalism, Minimalism - jeder Stil!',
        '',
        '## ⚡ Output-Format',
        '- Vollständiges HTML-Dokument: <!DOCTYPE html> bis </html>',
        '- ALLES in <style> Tags im <head> - kein externes CSS',
        '- KEIN Markdown, KEINE ```html Blöcke, KEINE Erklärungen',
        '- Direktes HTML, ready to inject',
        '',
        '## 🎭 Design-Trends 2025',
        '**Moderne Techniken die du nutzen sollst:**',
        '',
        '**Gradients & Colors:**',
        '```css',
        'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
        'background: radial-gradient(circle at top right, #f093fb, #f5576c);',
        'background: conic-gradient(from 180deg, #6366f1, #8b5cf6, #d946ef);',
        '```',
        '',
        '**Glassmorphism:**',
        '```css',
        'background: rgba(255, 255, 255, 0.1);',
        'backdrop-filter: blur(10px) saturate(180%);',
        'border: 1px solid rgba(255, 255, 255, 0.18);',
        '```',
        '',
        '**Text Gradients:**',
        '```css',
        'background: linear-gradient(135deg, #667eea, #764ba2);',
        '-webkit-background-clip: text;',
        '-webkit-text-fill-color: transparent;',
        '```',
        '',
        '**Shadows & Depth:**',
        '```css',
        'box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;',
        'text-shadow: 0 4px 12px rgba(0,0,0,0.5);',
        '```',
        '',
        '**Smooth Animations:**',
        '```css',
        'transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);',
        'animation: fadeInUp 0.8s ease-out;',
        '@keyframes fadeInUp {',
        '  from { opacity: 0; transform: translateY(30px); }',
        '  to { opacity: 1; transform: translateY(0); }',
        '}',
        '```',
        '',
        '## 📐 Layout-Prinzipien (flexibel!)',
        '',
        '**Header:**',
        '- Kann transparent sein (position: absolute)',
        '- Kann farbig sein, kann Glassmorphism haben',
        '- Logo + Navigation - oder ganz minimalistisch nur Logo',
        '- Sticky oder nicht - du entscheidest',
        '',
        '**Hero-Section (MACH ES EPISCH!):**',
        '- Minimum 100vh Height - fill the screen!',
        '- Große, fette Headlines: 64-96px (Desktop)',
        '- Gradients, Videos (als Platzhalter), Dark Overlays',
        '- CTAs die herausstechen (Neon, Glow-Effekte)',
        '- Asymmetrisches Layout erlaubt (Text links, Visual rechts schräg)',
        '',
        '**Content Sections:**',
        '- Mix es auf: white, dark, gradient backgrounds',
        '- Cards mit Hover-Effekten (lift, rotate, scale)',
        '- Bento-Grid Layouts (unterschiedliche Größen)',
        '- Timeline-Designs für Events',
        '- Masonry-ähnliche Grids für Portfolios',
        '',
        '**Footer:**',
        '- Kann dunkel sein (auch wenn Rest light ist)',
        '- Kann minimalistisch sein oder feature-rich',
        '- Deine Entscheidung basierend auf Design-Stil',
        '',
        '## 🎨 Farb-Systeme',
        '',
        '**Light Mode Palette:**',
        '```css',
        '--bg-primary: #ffffff;',
        '--bg-secondary: #f8f9fa;',
        '--text-primary: #111827;',
        '--text-secondary: #6b7280;',
        '```',
        '',
        '**Dark Mode Palette:**',
        '```css',
        '--bg-primary: #0f172a;',
        '--bg-secondary: #1e293b;',
        '--text-primary: #f1f5f9;',
        '--text-secondary: #94a3b8;',
        '```',
        '',
        '**Wähle selbst:** Light, Dark, oder Mix basierend auf Projekt-Vibe!',
        '',
        '## 🖼️ Bilder & Visuals',
        '- Hero: picsum.photos/1920/1080 (oder /1200/800 für Dark Themes)',
        '- Cards: picsum.photos/800/600',
        '- Portraits: picsum.photos/400/400',
        '- Nutze ?blur=2 oder ?grayscale für Effekte',
        '- Nutze Overlays: linear-gradient über Images',
        '',
        '## 📝 Content-Prinzipien',
        '',
        '**Headlines - Mach sie unvergesslich:**',
        '✅ "Fuck Average - Build Epic"',
        '✅ "Zero to Hero in 24h"',
        '✅ "The Future is Now"',
        '✅ "Don\'t Dream It - Do It"',
        '',
        '❌ "Willkommen bei uns"',
        '❌ "Ihr Partner für..."',
        '❌ "Hochwertige Dienstleistungen"',
        '',
        '**Tone of Voice:**',
        '- Modern: Tech-Sprache, kurz, prägnant ("Deploy in seconds")',
        '- Friendly: Locker, Du-Form ("Mach dein Ding!")',
        '- Elegant: Sophisticated, Premium ("Exzellenz ist Standard")',
        '- Playful: Frech, kreativ, unexpected',
        '',
        '## ✨ Advanced CSS Techniken',
        '',
        '**Custom Scrollbar (Webkit):**',
        '```css',
        '::-webkit-scrollbar { width: 8px; }',
        '::-webkit-scrollbar-track { background: #1e293b; }',
        '::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 4px; }',
        '```',
        '',
        '**Smooth Scroll:**',
        '```css',
        'html { scroll-behavior: smooth; scroll-padding-top: 80px; }',
        '```',
        '',
        '**Selection Colors:**',
        '```css',
        '::selection { background: #6366f1; color: #fff; }',
        '```',
        '',
        '**Blend Modes:**',
        '```css',
        'mix-blend-mode: multiply;',
        'background-blend-mode: overlay;',
        '```',
        '',
        '**Clip Paths (für coole Shapes):**',
        '```css',
        'clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);',
        '```',
        '',
        '## 🎯 Spezifische Design-Stile',
        '',
        '**Modern Tech (Vercel/Linear Style):**',
        '- Dark Background (#000 oder #0a0a0a)',
        '- White/Gray Text (#fff, #a1a1aa)',
        '- Accent Colors: Purple (#8b5cf6), Blue (#3b82f6)',
        '- Subtle Gradients, Glassmorphism',
        '- Clean, minimal, spacious',
        '',
        '**Vibrant/Creative:**',
        '- Bunte Gradients überall',
        '- Asymmetrische Layouts',
        '- Playful Animations',
        '- Mixed Fonts (Sans + Display)',
        '',
        '**Premium/Elegant:**',
        '- Serif Fonts (Playfair, Georgia)',
        '- Gold Accents (#d4af37)',
        '- Viel Whitespace',
        '- Luxuriöse Bilder',
        '',
        '**Brutalism:**',
        '- Raw HTML Feel',
        '- Starke Kontraste',
        '- Bold Typography',
        '- Asymmetrie',
        '',
        '## 🔒 Einzige Einschränkungen',
        '❌ **Verboten:**',
        '- <script> Tags (Security)',
        '- Inline onclick/onload Events (Security)',
        '- Externe href Links (nur #anchors)',
        '- Lorem Ipsum Text',
        '',
        '✅ **Alles andere ist erlaubt!**',
        '',
        '## 🚀 Finale Mission',
        'Erstelle eine Website die:',
        '1. 🎨 **Visuell beeindruckt** - People screenshot this!',
        '2. 🔥 **Modern ist** - 2025 cutting-edge',
        '3. 💎 **Einzigartig ist** - No template vibes',
        '4. 📱 **Responsiv ist** - Works everywhere',
        '5. ⚡ **Performant ist** - Smooth animations',
        '',
        'Du bist ein Künstler. Das Web ist deine Leinwand. Create magic! 🎨',
    ].join('\n');

    async generateWebsiteMockup(
        formValue: any,
        quality: QualityLevel = 'balanced'
    ): Promise<{ content: string; raw: string; tokensUsed: number }> {
        const prompt = this.buildEnhancedPrompt(formValue);
        const config = this.getGPT5Config(quality);

        console.log(`🚀 Generiere Website mit GPT-5 (${quality} mode)...`);

        const response = await this.client.chat.completions.create({
            model: 'gpt-5',
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
            reasoning_effort: config.reasoning_effort,
            max_completion_tokens: config.max_completion_tokens,
        });

        console.log(response);
        const raw = (response.choices[0]?.message?.content || '').trim();
        if (!raw) throw new Error('Leere Modell-Antwort');

        const sanitized = this.sanitizeHtml(raw);

        console.log(`✅ Generierung abgeschlossen! Tokens: ${response.usage?.total_tokens}`);

        return {
            content: sanitized,
            raw,
            tokensUsed: response.usage?.total_tokens || 0
        };
    }

    private getGPT5Config(quality: QualityLevel): GPT5Config {
        const configs: Record<QualityLevel, GPT5Config> = {
            fast: {
                reasoning_effort: 'low' as ReasoningEffort,
                max_completion_tokens: 10000,
            },
            balanced: {
                reasoning_effort: 'low' as ReasoningEffort,
                max_completion_tokens: 10000,
            },
            premium: {
                reasoning_effort: 'low' as ReasoningEffort,
                max_completion_tokens: 15000,
            }
        };

        return configs[quality];
    }

    private buildEnhancedPrompt(formValue: any): string {
        const {
            customerType,
            projectName,
            companyName,
            typeOfWebsite,
            primaryColor,
            designStyle,
            contentInformation,
        } = formValue;

        return `
# 🎨 Creative Brief: Erstelle ein Website-Meisterwerk!

## Projekt-Context
${contentInformation}

## Specs
- **Typ**: ${this.getWebsiteTypeDescription(typeOfWebsite)}
- **Name**: ${projectName}${companyName ? ` (${companyName})` : ''}
- **Zielgruppe**: ${customerType === 'business' ? 'B2B / Professional' : 'B2C / Consumer'}
- **Vibe**: ${designStyle}

## 🎨 Brand Colors (nutze sie kreativ!)
- **Primary**: ${primaryColor} → Kann überall hin (Backgrounds, CTAs, Accents)
- **Secondary**: ${primaryColor} → Mix it, blend it, gradient it!

**Du entscheidest:** Light Background? Dark Background? Gradient? Whatever looks best!

---

## 📋 Content-Struktur für ${typeOfWebsite}

${this.getCreativeWebsiteRequirements(typeOfWebsite)}

## 🎭 Design-Vibe: ${designStyle}

${this.getCreativeDesignGuidelines(designStyle)}

---

## 🚀 Your Mission

Create a website that makes people say "DAMN, that's beautiful!"

**Requirements:**
1. 🎨 **Visuell WOW** - Screenshot-worthy design
2. 🔥 **Modern AF** - 2025 aesthetics
3. 💎 **Unique** - No template bullshit
4. 📱 **Responsive** - Perfect on all screens
5. ⚡ **Smooth** - Buttery animations
6. 📝 **Real Content** - Based on context above, NO Lorem Ipsum!

**Technical:**
- Full HTML document (DOCTYPE to /html)
- All CSS in <head> <style> tags
- Mobile breakpoints: 640px, 768px, 1024px, 1280px
- Images: picsum.photos (smart dimensions)
- Animations: @keyframes welcome!

**Creative Freedom:**
- Dark mode? → Yes if it fits!
- Crazy gradients? → Hell yeah!
- Glassmorphism? → Absolutely!
- 3D effects? → Go for it!
- Unconventional layouts? → Do it!

Think like you're building this for $10k. Make it LEGENDARY! 🎨✨
`.trim();
    }

    private getCreativeWebsiteRequirements(type: string): string {
        const requirements: Record<string, string> = {
            'praesentation': `
🎨 **Portfolio/Company Showcase** - Premium Presence

**Hero:**
- Epic first impression - 100vh, bold headline
- Could be: Dark with gradient overlay, Light with huge typography, or Mixed
- CTA that pops: "View Work", "Get in Touch", "Let's Talk"

**Work/Services:**
- Bento-grid or Masonry layout (varied sizes)
- Hover effects: Lift, tilt, or reveal overlay
- Each item: Image + Title + Short description
- Consider: Asymmetric layout for visual interest

**About/Why:**
- Could be: Split screen (Text left, Image right)
- Or: Centered with floating elements
- 3-4 USPs with icons/emojis
- Team photos optional (circles or squares)

**Social Proof:**
- 2-3 testimonials with real-feeling quotes
- Person photo + Name + Company
- Could be: Cards, quotes, or integrated in other sections

**CTA Footer:**
- Big, bold, can't-miss section
- Gradient background or solid color
- "Ready to start?" type messaging
`,
            'landing': `
🚀 **Landing Page** - Conversion Machine

**Hero:**
- Problem → Solution messaging
- Headline: What you get (benefit, not feature)
- Sub: How it works or Why it matters
- CTA: Action verb ("Start Free", "Get Access", "Try Now")
- Trust signal: "No CC required" or "500+ users"

**Value Props:**
- 6 benefits in grid (2-3 columns)
- Icon + Headline + 1-sentence explanation
- Focus: What they achieve, not what you do

**Social Proof:**
- 3 testimonials with 5-star ratings
- Real names + companies (make them believable)
- Big numbers: "10k+ users", "4.9★ rating"

**Features/How it Works:**
- 3-step process or key features
- Visual: Numbers, icons, or illustrations
- Keep it simple and scannable

**Pricing (optional):**
- 2-3 tiers, middle one highlighted
- Clear pricing + top 5 features per tier
- CTA per plan

**FAQ:**
- 4-6 questions addressing concerns
- Accordion style (collapsed by default in design)

**Final CTA:**
- Full-width section, impossible to miss
- Urgency: "Join 1000+ teams" or "Limited spots"
- Button + reassurance text
`,
            'event': `
🎉 **Event Website** - Build Hype!

**Hero:**
- Date HUGE (biggest text on page)
- Event name + location
- Countdown feel (even if static)
- CTA: "Register Now", "Get Tickets", "RSVP Free"

**What to Expect:**
- 3-4 highlight cards
- Icons + short punchy descriptions
- Create FOMO: "Exclusive", "Limited", "Unlock"

**Schedule/Program:**
- Timeline layout (vertical or horizontal)
- Time + Activity + Speaker/Detail
- 5-8 items depending on event length

**Speakers/Guests:**
- 4-6 people in grid
- Round photos + Name + Title + 1-line bio
- Make them look important

**Tickets/Pricing:**
- If paid: Show tiers (Early Bird, Regular, VIP)
- If free: Show "spots remaining"
- CTA prominent

**Location/Venue:**
- Address + directions
- Map placeholder (gray box with pin icon)
- Parking/transport info if relevant
`
        };
        return requirements[type] || '';
    }

    private getCreativeDesignGuidelines(style: string): string {
        const guidelines: Record<string, string> = {
            'modern': `
**Modern/Tech:**
- Think: Vercel, Linear, Stripe vibes
- Color scheme: Dark (#0a0a0a) OR Light (#fff) - pick one that fits
- Accent: Vibrant purple/blue from brand colors
- Typography: Clean sans-serif, big sizes (72px+ headlines)
- Glassmorphism elements
- Subtle gradients
- Smooth animations (0.6s cubic-bezier)
- Minimalist but impactful
`,
            'friendly': `
**Friendly/Approachable:**
- Warm color palette
- Rounded everything (border-radius: 16-24px)
- Playful hover effects
- Emoji icons welcome
- Soft shadows
- Inviting CTAs
- Could be light with pastels OR dark with warm accents
- Conversational copy tone
`,
            'elegant': `
**Elegant/Premium:**
- Sophisticated palette: Black, White, Gold accents
- Serif fonts for headlines (Georgia, Playfair Display feel)
- Lots of whitespace
- Minimal animations
- High-quality imagery feel
- Luxury vibes
- Could be: Light with gold accents OR Dark with subtle glow
- Refined, never loud
`,
            'playful': `
**Playful/Creative:**
- Bold, vibrant colors
- Crazy gradients encouraged
- Asymmetric layouts
- Fun animations
- Mixed typography
- Unexpected elements
- Could be: Colorful light theme OR Dark with neon accents
- Break the rules!
`
        };
        return guidelines[style] || guidelines['modern'];
    }

    private getWebsiteTypeDescription(type: string): string {
        const descriptions: Record<string, string> = {
            'praesentation': 'Portfolio / Company Showcase / Brand Presence',
            'landing': 'Product Landing / Lead Generation / Conversion Page',
            'event': 'Conference / Meetup / Festival / Workshop'
        };
        return descriptions[type] || 'Website';
    }

    private sanitizeHtml(html: string): string {
        console.log('🔍 Original HTML Länge:', html.length);

        // 1. Entferne Markdown Wrapper
        let clean = html.trim();
        if (clean.startsWith('```html')) {
            clean = clean.replace(/^```html\n?/i, '').replace(/```\s*$/i, '');
            console.log('✅ Markdown wrapper entfernt');
        } else if (clean.startsWith('```')) {
            clean = clean.replace(/^```\n?/i, '').replace(/```\s*$/i, '');
            console.log('✅ Code block wrapper entfernt');
        }

        // 2. Scripts entfernen (Security)
        clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');

        // 3. Inline Event Handler entfernen (Security)
        clean = clean.replace(/\son(click|load|submit|change|mouse\w+|key\w+)\s*=\s*(['"]).*?\2/gi, '');

        // 4. Buttons in spans (behält alle anderen Attribute)
        clean = clean.replace(/<button([^>]*)>([\s\S]*?)<\/button>/gi, (match, attrs, content) => {
            const cleanAttrs = attrs.replace(/\s*type\s*=\s*(['"])(submit|button|reset)\1/gi, '');
            return `<span class="btn"${cleanAttrs}>${content}</span>`;
        });

        // 5. Externe URLs in Links ersetzen
        clean = clean.replace(/<a([^>]*)>/gi, (match, attrs) => {
            const cleanAttrs = attrs.replace(/href\s*=\s*(['"])(https?:\/\/[^'"]+)\1/gi, 'href="#"');
            return `<a${cleanAttrs}>`;
        });

        // 6. Nur externe <link> Tags entfernen (nicht alle!)
        clean = clean.replace(/<link[^>]+href\s*=\s*(['"])(https?:\/\/[^'"]+)\1[^>]*>/gi, '');

        // 7. Form actions entfernen
        clean = clean.replace(/<form([^>]*)>/gi, (match, attrs) => {
            const cleanAttrs = attrs.replace(/\s*action\s*=\s*(['"])[^'"]*\1/gi, '');
            return `<form${cleanAttrs}>`;
        });

        // 8. Target & Rel entfernen
        clean = clean
            .replace(/\s+target\s*=\s*(['"])[^'"]*\1/gi, '')
            .replace(/\s+rel\s*=\s*(['"])[^'"]*\1/gi, '');

        console.log('✅ Final HTML Länge:', clean.length);

        // Validation
        if (clean.length < 1000) {
            console.warn('⚠️ HTML sehr kurz');
        }

        if (!clean.includes('<!DOCTYPE') && !clean.includes('<html')) {
            console.warn('⚠️ Kein vollständiges HTML-Dokument');
        }

        return clean;
    }
}