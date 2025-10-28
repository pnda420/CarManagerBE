// alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertsController } from './alerts.controller';
import { Car } from '../cars/cars.entity';
import { User } from '../users/users.entity';
import { EmailModule } from '../email/email.module';
import { AlertSettings } from './alert-settings.entity';
import { AlertsService } from './alerts.service';
import { AlertSettingsController } from './alert-settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car, User, AlertSettings]),
    ScheduleModule.forRoot(),
    EmailModule,
  ],
  controllers: [
    AlertsController,
    AlertSettingsController,
  ],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}