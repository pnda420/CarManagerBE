// alerts/alerts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Car } from '../cars/cars.entity';
import { User } from '../users/users.entity';
import { EmailService } from '../email/email.service';
import { AlertSettings } from './alert-settings.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

interface AlertCheck {
  car: Car;
  user: User;
  settings: AlertSettings;
  alertType: 'tuv' | 'service' | 'mileage';
  message: string;
  daysUntil?: number;
  kmUntil?: number;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Car)
    private readonly carRepo: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AlertSettings)
    private readonly alertSettingsRepo: Repository<AlertSettings>,
    private readonly emailService: EmailService,
  ) {}


  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkAllAlertsAutomatically() {
    this.logger.log('🔔 Starte automatische Alert-Prüfung...');
    await this.checkAllAlerts();
  }

  async checkAllAlerts(): Promise<void> {
    this.logger.log('Prüfe alle Alerts...');

    const alertsToSend: AlertCheck[] = [];

    // Hole alle Autos mit ihren Usern und Settings
    const cars = await this.carRepo.find({
      relations: ['user'],
    });

    for (const car of cars) {
      const settings = await this.getOrCreateAlertSettings(car.userId);

      // Skip wenn Alerts deaktiviert
      if (!settings.alertsEnabled) {
        continue;
      }

      // Prüfe TÜV
      if (settings.tuvAlertEnabled && car.nextTuvDate) {
        const tuvAlert = this.checkTuvAlert(car, settings);
        if (tuvAlert) {
          alertsToSend.push({
            car,
            user: car.user,
            settings,
            ...tuvAlert,
          });
        }
      }

      // Prüfe Service (Datum)
      if (settings.serviceAlertEnabled && car.nextServiceDate) {
        const serviceAlert = this.checkServiceDateAlert(car, settings);
        if (serviceAlert) {
          alertsToSend.push({
            car,
            user: car.user,
            settings,
            ...serviceAlert,
          });
        }
      }

      // Prüfe Service (Kilometer)
      if (settings.serviceAlertEnabled && car.nextServiceKm) {
        const serviceKmAlert = this.checkServiceKmAlert(car, settings);
        if (serviceKmAlert) {
          alertsToSend.push({
            car,
            user: car.user,
            settings,
            ...serviceKmAlert,
          });
        }
      }

      // Prüfe Mileage Target
      if (settings.mileageAlertEnabled && settings.mileageTargetKm) {
        const mileageAlert = this.checkMileageAlert(car, settings);
        if (mileageAlert) {
          alertsToSend.push({
            car,
            user: car.user,
            settings,
            ...mileageAlert,
          });
        }
      }
    }

    // Sende alle gesammelten Alerts
    this.logger.log(`📧 Sende ${alertsToSend.length} Alerts...`);
    for (const alert of alertsToSend) {
      await this.sendAlertEmail(alert);
    }

    this.logger.log('✅ Alert-Prüfung abgeschlossen');
  }

  private checkTuvAlert(
    car: Car,
    settings: AlertSettings,
  ): { alertType: 'tuv'; message: string; daysUntil: number } | null {
    const today = new Date();
    const tuvDate = new Date(car.nextTuvDate);
    const daysUntil = Math.floor(
      (tuvDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Nur warnen wenn innerhalb der konfigurierten Tage
    if (daysUntil <= settings.tuvDaysBefore && daysUntil >= 0) {
      // Prüfe ob bereits eine Warnung gesendet wurde (max 1x pro Woche)
    //   if (this.wasRecentlyAlerted(car.id, 'tuv', settings, 7)) {
    //     return null;
    //   }

      return {
        alertType: 'tuv',
        message: `Der TÜV für dein Fahrzeug "${car.name}" läuft in ${daysUntil} Tag(en) ab!`,
        daysUntil,
      };
    }

    // TÜV bereits abgelaufen
    if (daysUntil < 0) {
      if (this.wasRecentlyAlerted(car.id, 'tuv', settings, 7)) {
        return null;
      }

      return {
        alertType: 'tuv',
        message: `⚠️ Der TÜV für dein Fahrzeug "${car.name}" ist bereits ${Math.abs(daysUntil)} Tag(e) abgelaufen!`,
        daysUntil,
      };
    }

    return null;
  }

  private checkServiceDateAlert(
    car: Car,
    settings: AlertSettings,
  ): { alertType: 'service'; message: string; daysUntil: number } | null {
    const today = new Date();
    const serviceDate = new Date(car.nextServiceDate);
    const daysUntil = Math.floor(
      (serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil <= settings.serviceDaysBefore && daysUntil >= 0) {
      if (this.wasRecentlyAlerted(car.id, 'service', settings, 7)) {
        return null;
      }

      return {
        alertType: 'service',
        message: `Der nächste Service für "${car.name}" steht in ${daysUntil} Tag(en) an!`,
        daysUntil,
      };
    }

    if (daysUntil < 0) {
      if (this.wasRecentlyAlerted(car.id, 'service', settings, 7)) {
        return null;
      }

      return {
        alertType: 'service',
        message: `⚠️ Der Service für "${car.name}" ist ${Math.abs(daysUntil)} Tag(e) überfällig!`,
        daysUntil,
      };
    }

    return null;
  }

  private checkServiceKmAlert(
    car: Car,
    settings: AlertSettings,
  ): { alertType: 'service'; message: string; kmUntil: number } | null {
    const kmUntil = car.nextServiceKm - car.mileageKm;

    if (kmUntil <= settings.serviceKmBefore && kmUntil >= 0) {
      if (this.wasRecentlyAlerted(car.id, 'service', settings, 7)) {
        return null;
      }

      return {
        alertType: 'service',
        message: `Der nächste Service für "${car.name}" ist in ${kmUntil} km fällig!`,
        kmUntil,
      };
    }

    if (kmUntil < 0) {
      if (this.wasRecentlyAlerted(car.id, 'service', settings, 7)) {
        return null;
      }

      return {
        alertType: 'service',
        message: `⚠️ Der Service für "${car.name}" ist ${Math.abs(kmUntil)} km überfällig!`,
        kmUntil,
      };
    }

    return null;
  }

  private checkMileageAlert(
    car: Car,
    settings: AlertSettings,
  ): { alertType: 'mileage'; message: string; kmUntil: number } | null {
    const kmUntil = settings.mileageTargetKm - car.mileageKm;

    // Warnung bei 1000km vor dem Ziel
    if (kmUntil <= 1000 && kmUntil >= 0) {
      if (this.wasRecentlyAlerted(car.id, 'mileage', settings, 30)) {
        return null;
      }

      return {
        alertType: 'mileage',
        message: `Dein Fahrzeug "${car.name}" erreicht bald ${settings.mileageTargetKm.toLocaleString('de-DE')} km! Aktuell: ${car.mileageKm.toLocaleString('de-DE')} km`,
        kmUntil,
      };
    }

    // Ziel erreicht/überschritten
    if (kmUntil <= 0) {
      if (this.wasRecentlyAlerted(car.id, 'mileage', settings, 30)) {
        return null;
      }

      return {
        alertType: 'mileage',
        message: `🎉 Dein Fahrzeug "${car.name}" hat ${settings.mileageTargetKm.toLocaleString('de-DE')} km erreicht!`,
        kmUntil,
      };
    }

    return null;
  }

  private wasRecentlyAlerted(
    carId: string,
    alertType: 'tuv' | 'service' | 'mileage',
    settings: AlertSettings,
    daysSince: number,
  ): boolean {
    const lastAlerts = settings.lastAlertsSent[carId];
    if (!lastAlerts || !lastAlerts[alertType]) {
      return false;
    }

    const lastAlertDate = new Date(lastAlerts[alertType]);
    const daysSinceAlert = Math.floor(
      (Date.now() - lastAlertDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSinceAlert < daysSince;
  }

  private async sendAlertEmail(alert: AlertCheck): Promise<void> {
    try {
      const subject = this.getAlertSubject(alert.alertType);

      await this.emailService.sendCarAlert({
        to_email: alert.user.email,
        subject: subject,
        greeting: `Hallo`,
        customer_name: alert.user.name,
        message: alert.message,
        car_name: alert.car.name,
        alert_message: alert.message,
        car_details: this.formatCarDetails(alert.car),
      });

      // Update lastAlertsSent
      await this.updateLastAlertSent(
        alert.settings.id,
        alert.car.id,
        alert.alertType,
      );

      this.logger.log(
        `✅ Alert gesendet: ${alert.alertType} für ${alert.car.name} an ${alert.user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Fehler beim Senden von Alert für ${alert.car.name}:`,
        error,
      );
    }
  }

  private async updateLastAlertSent(
    settingsId: string,
    carId: string,
    alertType: 'tuv' | 'service' | 'mileage',
  ): Promise<void> {
    const settings = await this.alertSettingsRepo.findOne({
      where: { id: settingsId },
    });

    if (!settings) return;

    if (!settings.lastAlertsSent[carId]) {
      settings.lastAlertsSent[carId] = {};
    }

    settings.lastAlertsSent[carId][alertType] = new Date().toISOString();

    await this.alertSettingsRepo.save(settings);
  }

  private getAlertSubject(alertType: 'tuv' | 'service' | 'mileage'): string {
    switch (alertType) {
      case 'tuv':
        return '🚗 TÜV-Erinnerung für dein Fahrzeug';
      case 'service':
        return '🔧 Service-Erinnerung für dein Fahrzeug';
      case 'mileage':
        return '📊 Kilometerstand-Benachrichtigung';
    }
  }

  private formatCarDetails(car: Car): string {
    const details: string[] = [];

    if (car.licensePlate) details.push(`Kennzeichen: ${car.licensePlate}`);
    if (car.modelYear) details.push(`Baujahr: ${car.modelYear}`);
    details.push(`Kilometerstand: ${car.mileageKm.toLocaleString('de-DE')} km`);
    if (car.nextTuvDate) details.push(`Nächster TÜV: ${car.nextTuvDate}`);
    if (car.nextServiceDate)
      details.push(`Nächster Service: ${car.nextServiceDate}`);
    if (car.nextServiceKm)
      details.push(
        `Service bei: ${car.nextServiceKm.toLocaleString('de-DE')} km`,
      );

    return details.join(' | ');
  }

private async getOrCreateAlertSettings(
  userId: string,
): Promise<AlertSettings> {
  let settings = await this.alertSettingsRepo.findOne({
    where: { userId },
  });

  if (!settings) {
    settings = await this.alertSettingsRepo.save({
      userId,
      alertsEnabled: true,
      tuvAlertEnabled: true,
      serviceAlertEnabled: true,
      mileageAlertEnabled: false,
      tuvDaysBefore: 30,
      serviceDaysBefore: 14,
      serviceKmBefore: 1000,
      lastAlertsSent: {},
    });
  }

  return settings;
}

  // Public methods für User Alert Settings Management
  async getAlertSettings(userId: string): Promise<AlertSettings> {
    return this.getOrCreateAlertSettings(userId);
  }

  async updateAlertSettings(
    userId: string,
    updates: Partial<AlertSettings>,
  ): Promise<AlertSettings> {
    const settings = await this.getOrCreateAlertSettings(userId);
    Object.assign(settings, updates);
    return this.alertSettingsRepo.save(settings);
  }

  async testAlert(userId: string, carId: string): Promise<void> {
    const car = await this.carRepo.findOne({
      where: { id: carId, userId },
      relations: ['user'],
    });

    if (!car) {
      throw new Error('Car not found');
    }

    const settings = await this.getOrCreateAlertSettings(userId);

    await this.sendAlertEmail({
      car,
      user: car.user,
      settings,
      alertType: 'tuv',
      message: '🧪 Dies ist eine Test-Benachrichtigung für dein Fahrzeug.',
    });
  }
}