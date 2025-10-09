import { Module } from '@nestjs/common';
import { PageAiController } from './page-ai.controller';
import { PageAiService } from './page-ai.service';
import { GeneratedPagesModule } from '../generated-pages/generated-pages.module';

@Module({
  imports: [
    GeneratedPagesModule // Importiert Service + TypeORM
  ],
  controllers: [PageAiController],
  providers: [PageAiService],
})
export class PageAiModule {}