import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import * as zlib from 'zlib';
import { Readable, pipeline } from 'stream';

@Injectable()
export class ProxyService {
  private readonly TIMEOUT = 30000; // 30 Sekunden
  private readonly MAX_REDIRECTS = 5;
  private readonly ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
  private readonly BLOCKED_DOMAINS = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
  ]);

  async fetchAndProxy(url: string, res: Response): Promise<void> {
    // URL validieren
    const parsedUrl = this.validateUrl(url);
    
    // Domain-Blacklist prüfen
    this.checkBlockedDomain(parsedUrl);

    await this.fetchWithRedirects(parsedUrl, res, 0);
  }

  private validateUrl(url: string): URL {
    let parsedUrl: URL;
    
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new HttpException('Invalid URL format', HttpStatus.BAD_REQUEST);
    }

    // Protokoll prüfen
    if (!this.ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
      throw new HttpException(
        'Only HTTP and HTTPS protocols are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsedUrl;
  }

  private checkBlockedDomain(parsedUrl: URL): void {
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Localhost und interne IPs blockieren
    if (this.BLOCKED_DOMAINS.has(hostname)) {
      throw new HttpException(
        'Access to internal resources is forbidden',
        HttpStatus.FORBIDDEN,
      );
    }

    // Private IP-Bereiche blockieren (SSRF-Schutz)
    if (this.isPrivateIP(hostname)) {
      throw new HttpException(
        'Access to private networks is forbidden',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private isPrivateIP(hostname: string): boolean {
    const patterns = [
      /^10\./,                    // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
      /^192\.168\./,              // 192.168.0.0/16
      /^169\.254\./,              // 169.254.0.0/16 (Link-Local)
      /^127\./,                   // 127.0.0.0/8 (Loopback)
      /^0\.0\.0\.0$/,             // 0.0.0.0
      /^(fc|fd)[0-9a-f]{2}:/i,    // IPv6 private
    ];

    return patterns.some(pattern => pattern.test(hostname));
  }

  private async fetchWithRedirects(
    parsedUrl: URL,
    res: Response,
    redirectCount: number,
  ): Promise<void> {
    if (redirectCount >= this.MAX_REDIRECTS) {
      throw new HttpException(
        'Too many redirects',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const client = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise<void>((resolve, reject) => {
      const options: https.RequestOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: this.TIMEOUT,
      };

      const req = client.get(parsedUrl, options, (proxyRes) => {
        const statusCode = proxyRes.statusCode || 500;

        // Handle Redirects
        if (statusCode >= 300 && statusCode < 400) {
          const location = proxyRes.headers.location;
          
          if (!location) {
            reject(new HttpException('Redirect without location', HttpStatus.BAD_GATEWAY));
            return;
          }

          // Relativen redirect zu absoluter URL machen
          let redirectUrl: URL;
          try {
            redirectUrl = new URL(location, parsedUrl);
          } catch {
            reject(new HttpException('Invalid redirect URL', HttpStatus.BAD_GATEWAY));
            return;
          }

          // Blockierte Domain erneut prüfen
          try {
            this.checkBlockedDomain(redirectUrl);
          } catch (error) {
            reject(error);
            return;
          }

          // Drain the response before following redirect
          proxyRes.resume();
          
          this.fetchWithRedirects(redirectUrl, res, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          
          return;
        }

        // Fehlerhafte Status Codes
        if (statusCode >= 400) {
          proxyRes.resume(); // Drain response
          reject(
            new HttpException(
              `Upstream returned ${statusCode}`,
              statusCode >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.NOT_FOUND,
            ),
          );
          return;
        }

        // Status weiterreichen
        res.status(statusCode);

        // Headers filtern und weiterreichen
        this.forwardHeaders(proxyRes, res);

        // Content dekomprimieren wenn nötig
        const stream = this.decompressStream(proxyRes);

        // Stream an Client
        pipeline(stream, res, (err) => {
          if (err) {
            console.error('Pipeline error:', err);
            reject(new HttpException('Stream error', HttpStatus.INTERNAL_SERVER_ERROR));
          } else {
            resolve();
          }
        });
      });

      req.on('error', (err) => {
        console.error('Request error:', err);
        reject(new HttpException(
          `Failed to fetch: ${err.message}`,
          HttpStatus.BAD_GATEWAY,
        ));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new HttpException('Request timeout', HttpStatus.GATEWAY_TIMEOUT));
      });
    });
  }

  private forwardHeaders(proxyRes: http.IncomingMessage, res: Response): void {
    // Hop-by-hop headers die nicht weitergereicht werden dürfen
    const hopByHopHeaders = new Set([
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
      'content-encoding', // Wird manuell behandelt
      'content-length',   // Wird neu berechnet
    ]);

    // Sichere Headers die nicht weitergereicht werden sollten
    const securityHeaders = new Set([
      'x-frame-options',
      'content-security-policy',
      'content-security-policy-report-only',
      'x-content-type-options',
      'strict-transport-security',
    ]);

    // Headers durchgehen
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      const lowerKey = key.toLowerCase();
      
      if (
        value !== undefined &&
        !hopByHopHeaders.has(lowerKey) &&
        !securityHeaders.has(lowerKey)
      ) {
        res.setHeader(key, value as string | string[]);
      }
    }

    // Eigene Headers setzen um Embedding zu erlauben
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // CSP entfernen oder anpassen
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
  }

  private decompressStream(proxyRes: http.IncomingMessage): Readable {
    const encoding = (proxyRes.headers['content-encoding'] || '').toString().toLowerCase();

    switch (encoding) {
      case 'gzip':
        return proxyRes.pipe(zlib.createGunzip());
      
      case 'deflate':
        return proxyRes.pipe(zlib.createInflate());
      
      case 'br':
        return proxyRes.pipe(zlib.createBrotliDecompress());
      
      default:
        return proxyRes;
    }
  }
}