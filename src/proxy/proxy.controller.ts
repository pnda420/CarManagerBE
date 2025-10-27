import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller('api/proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('fetch')
  async proxyRequest(
    @Query('url') url: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!url) {
      throw new HttpException(
        'URL parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // URL Länge limitieren (DoS-Schutz)
    if (url.length > 2048) {
      throw new HttpException(
        'URL too long',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.proxyService.fetchAndProxy(url, res);
    } catch (error) {
      console.error('Proxy controller error:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to proxy request: ' + error.message,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // OPTIONS für CORS Preflight
  @Get('fetch')
  async handleOptions(@Res() res: Response): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
  }
}