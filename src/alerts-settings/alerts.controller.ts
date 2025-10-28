// alerts/alerts.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * Manueller Trigger für Alert-Check (nur Admin)
   * Falls du doch einen Endpoint brauchst (z.B. für Tests oder externe Cron)
   */
  @Post('check')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async triggerAlertCheck() {
    await this.alertsService.checkAllAlerts();
    return {
      message: 'Alert check triggered successfully',
      timestamp: new Date().toISOString(),
    };
  }
}