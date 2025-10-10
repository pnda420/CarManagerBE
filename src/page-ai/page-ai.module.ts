import { Module } from '@nestjs/common';
import { PageAiController } from './page-ai.controller';
import { PageAiService } from './page-ai.service';
import { GeneratedPagesModule } from '../generated-pages/generated-pages.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    GeneratedPagesModule, // Importiert Service + TypeORM
    EmailModule
  ],
  controllers: [PageAiController],
  providers: [PageAiService],
})
export class PageAiModule {}