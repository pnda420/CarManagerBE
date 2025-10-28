// users/alert-settings.entity.ts
import { User } from 'src/users/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('alert_settings')
export class AlertSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Alert toggles
  @Column({ default: true })
  alertsEnabled: boolean;

  @Column({ default: true })
  tuvAlertEnabled: boolean;

  @Column({ default: true })
  serviceAlertEnabled: boolean;

  @Column({ default: false })
  mileageAlertEnabled: boolean;

  // Tage vor Ablauf für TÜV-Warnung
  @Column({ type: 'int', default: 30 })
  tuvDaysBefore: number;

  // Tage vor Ablauf für Service-Warnung (nach Datum)
  @Column({ type: 'int', default: 14 })
  serviceDaysBefore: number;

  // km vor Service-Warnung (nach Kilometerstand)
  @Column({ type: 'int', default: 1000 })
  serviceKmBefore: number;

  // Optionales Mileage-Ziel (z.B. warnen bei 200.000 km)
  @Column({ type: 'int', nullable: true })
  mileageTargetKm: number;

  // Letzte gesendete Benachrichtigungen (um Spam zu vermeiden)
  @Column({ type: 'jsonb', default: {} })
  lastAlertsSent: {
    [carId: string]: {
      tuv?: string; // ISO Datum
      service?: string;
      mileage?: string;
    };
  };

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}