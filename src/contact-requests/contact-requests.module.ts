import { Module } from '@nestjs/common';
import { ContactRequestsService } from './contact-requests.service';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactRequest } from './contact-requests.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactRequest])
  ],
  providers: [ContactRequestsService],
  exports: [ContactRequestsService],
  controllers: [ContactRequestsController]
})
export class ContactRequestsModule {}
