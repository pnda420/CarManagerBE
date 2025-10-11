// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { GeneratedPagesModule } from './generated-pages/generated-pages.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';
import { ContactRequest } from './contact-requests/contact-requests.entity';
import { GeneratedPage } from './generated-pages/generated-pages.entity';
import { User } from './users/users.entity';
import { AuthModule } from './auth/auth.module';
import { PageAiModule } from './page-ai/page-ai.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER ?? 'app',
      password: process.env.DB_PASS ?? 'secret',
      database: process.env.DB_NAME ?? 'appdb',
      entities: [User, GeneratedPage, ContactRequest],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    UsersModule,
    AuthModule,
    GeneratedPagesModule,
    ContactRequestsModule,
    PageAiModule,
    EmailModule,
  ],
})
export class AppModule { }
