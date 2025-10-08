import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto, UpdateContactRequestDto } from './contact-requests.dto';

@Controller('contact-requests')
export class ContactRequestsController {
  constructor(private readonly contactService: ContactRequestsService) {}

  // Öffentliche Route - jeder kann Kontaktanfrage stellen
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactRequestDto) {
    return this.contactService.create(dto);
  }

  // Admin-Routen (später mit Auth Guard schützen!)
  // @UseGuards(AdminGuard)
  @Get()
  async findAll() {
    return this.contactService.findAll();
  }

  // @UseGuards(AdminGuard)
  @Get('unprocessed')
  async findUnprocessed() {
    return this.contactService.findUnprocessed();
  }

  // @UseGuards(AdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  // @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContactRequestDto) {
    return this.contactService.update(id, dto);
  }

  // @UseGuards(AdminGuard)
  @Patch(':id/process')
  async markAsProcessed(@Param('id') id: string) {
    return this.contactService.markAsProcessed(id);
  }

  // @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}