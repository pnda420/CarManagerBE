// tuning/tuning.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuningController } from './tuning.controller';
import { TuningService } from './tuning.service';
import { TuningGroup } from './tuning-group.entity';
import { TuningPart } from './tuning-part.entity';
import { CarsModule } from '../cars/cars.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TuningGroup, TuningPart]),
    CarsModule, // Import CarsModule to use CarsService
  ],
  controllers: [TuningController],
  providers: [TuningService],
  exports: [TuningService],
})
export class TuningModule {}