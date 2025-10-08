import { Module } from '@nestjs/common';
import { GeneratedPagesService } from './generated-pages.service';
import { GeneratedPagesController } from './generated-pages.controller';
import { GeneratedPage } from './generated-pages.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedPage])
  ],
  providers: [GeneratedPagesService],
  exports: [GeneratedPagesService],
  controllers: [GeneratedPagesController]
})
export class GeneratedPagesModule {}
