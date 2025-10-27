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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: 5432,
      username: 'app' ,
      password: 'secret' ,
      database: 'db_car_manager' ,
      entities: [User, Car, TuningGroup, TuningPart],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    UsersModule,
    AuthModule,
    EmailModule,
    TuningModule,
    CarsModule,
    ProxyModule,
  ],
})
export class AppModule { }
