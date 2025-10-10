import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { GeneratedPagesModule } from './generated-pages/generated-pages.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';
import { ContactRequest } from './contact-requests/contact-requests.entity';
import { GeneratedPage } from './generated-pages/generated-pages.entity';
import { User } from './users/users.entity';
import { CreateUserDto, LoginDto, NewsletterSubscribeDto, UpdateUserDto } from './users/users.dto';
import { AuthModule } from './auth/auth.module';
import { PageAiModule } from './page-ai/page-ai.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite', // Speicherort der DB-Datei
      entities: [User, GeneratedPage, ContactRequest],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
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