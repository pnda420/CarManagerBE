
import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Post,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { UpdateAlertSettingsDto } from './alert-settings.dto';

@Controller('alert-settings')
@UseGuards(JwtAuthGuard)
export class AlertSettingsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async getMyAlertSettings(@Req() req: any) {
    return this.alertsService.getAlertSettings(req.user.userId);
  }

  @Patch()
  async updateMyAlertSettings(
    @Req() req: any,
    @Body() dto: UpdateAlertSettingsDto,
  ) {
    return this.alertsService.updateAlertSettings(req.user.userId, dto);
  }

  @Post('test/:carId')
  async sendTestAlert(@Req() req: any, @Param('carId') carId: string) {
    await this.alertsService.testAlert(req.user.userId, carId);
    return { message: 'Test alert sent successfully' };
  }
}