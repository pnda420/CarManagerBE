// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { TuningModule } from './tuning/tuning.module';
import { CarsModule } from './cars/cars.module';
import { Car } from './cars/cars.entity';
import { TuningGroup } from './tuning/tuning-group.entity';
import { TuningPart } from './tuning/tuning-part.entity';
import { ProxyModule } from './proxy/proxy.module';
import { AlertsModule } from './alerts-settings/alerts.module';
import { AlertSettings } from './alerts-settings/alert-settings.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: 5433,
      username: 'app' ,
      password: 'secret' ,
      database: 'db_car_manager' ,
      entities: [User, Car, TuningGroup, TuningPart, AlertSettings],
      migrations: ['dist/migrations/*.js'],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    UsersModule,
    AuthModule,
    EmailModule,
    TuningModule,
    CarsModule,
    ProxyModule,
    AlertsModule,
  ],
})
export class AppModule { }
