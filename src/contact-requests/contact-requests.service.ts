import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRequest } from './contact-requests.entity';
import { CreateContactRequestDto, UpdateContactRequestDto } from './contact-requests.dto';

@Injectable()
export class ContactRequestsService {
  constructor(
    @InjectRepository(ContactRequest)
    private readonly contactRepo: Repository<ContactRequest>,
  ) {}

  async create(dto: CreateContactRequestDto): Promise<ContactRequest> {
    const request = this.contactRepo.create(dto);
    const saved = await this.contactRepo.save(request);
    
    // TODO: Hier kannst du eine E-Mail an dich selbst senden
    // await this.emailService.sendContactNotification(saved);
    
    return saved;
  }

  async findAll(): Promise<ContactRequest[]> {
    return this.contactRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findUnprocessed(): Promise<ContactRequest[]> {
    return this.contactRepo.find({
      where: { isProcessed: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContactRequest> {
    const request = await this.contactRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!request) {
      throw new NotFoundException(`Contact request with ID ${id} not found`);
    }
    
    return request;
  }

  async update(id: string, dto: UpdateContactRequestDto): Promise<ContactRequest> {
    const request = await this.findOne(id);
    Object.assign(request, dto);
    return this.contactRepo.save(request);
  }

  async markAsProcessed(id: string): Promise<ContactRequest> {
    return this.update(id, { isProcessed: true });
  }

  async delete(id: string): Promise<void> {
    const result = await this.contactRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact request with ID ${id} not found`);
    }
  }
}