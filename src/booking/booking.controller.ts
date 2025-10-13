import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingSlotDto, UpdateBookingSlotDto, CreateBookingDto, UpdateBookingDto } from './booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // ==================== SLOTS ====================

  // PUBLIC: Verfügbare Slots abrufen
  @Get('slots/available')
  async getAvailableSlots(@Query('fromDate') fromDate?: string) {
    return this.bookingService.getAvailableSlots(fromDate);
  }

  // PUBLIC: Slots für ein bestimmtes Datum
  @Get('slots/date/:date')
  async getSlotsByDate(@Param('date') date: string) {
    return this.bookingService.getSlotsByDate(date);
  }

  // ADMIN: Alle Slots abrufen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('slots')
  async getAllSlots() {
    return this.bookingService.getAllSlots();
  }

  // ADMIN: Einzelnen Slot erstellen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('slots')
  async createSlot(@Body() dto: CreateBookingSlotDto) {
    return this.bookingService.createSlot(dto);
  }

  // ADMIN: Mehrere Slots auf einmal erstellen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('slots/bulk')
  async createMultipleSlots(@Body() dto: { slots: CreateBookingSlotDto[] }) {
    return this.bookingService.createMultipleSlots(dto.slots);
  }

  // ADMIN: Slot aktualisieren
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('slots/:id')
  async updateSlot(@Param('id') id: string, @Body() dto: UpdateBookingSlotDto) {
    return this.bookingService.updateSlot(id, dto);
  }

  // ADMIN: Slot löschen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('slots/:id')
  async deleteSlot(@Param('id') id: string) {
    return this.bookingService.deleteSlot(id);
  }

  // ==================== BOOKINGS ====================

  // PUBLIC: Booking erstellen
  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  // ADMIN: Alle Bookings abrufen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  // ADMIN: Einzelne Booking abrufen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  async getBookingById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  // ADMIN: Booking aktualisieren
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  async updateBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingService.updateBooking(id, dto);
  }

  // ADMIN: Booking stornieren
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/cancel')
  async cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }

  // ADMIN: Booking löschen
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingService.deleteBooking(id);
  }
}