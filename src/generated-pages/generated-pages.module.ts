import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedPagesController } from './generated-pages.controller';
import { GeneratedPagesService } from './generated-pages.service';
import { GeneratedPage } from './generated-pages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedPage]) // Repository registrieren
  ],
  controllers: [GeneratedPagesController],
  providers: [GeneratedPagesService],
  exports: [
    GeneratedPagesService,
    TypeOrmModule // WICHTIG: TypeOrmModule auch exportieren!
  ]
})
export class GeneratedPagesModule {}