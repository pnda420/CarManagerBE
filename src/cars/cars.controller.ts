// cars/cars.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto, UpdateCarDto } from './cars.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
    constructor(private readonly carsService: CarsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req, @Body() dto: CreateCarDto) {
        return this.carsService.create(req.user.userId, dto);
    }

    @Get()
    async findAll(@Request() req) {
        return this.carsService.findAll(req.user.userId);
    }

    @Get('all')
    async getAll() {
        return this.carsService.getAll();
    }

    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        return this.carsService.findOne(id, req.user.userId);
    }

    @Get('all/:id')
    async findOneAll(@Request() req, @Param('id') id: string) {
        return this.carsService.findOneGlobal(id);
    }

    @Patch(':id')
    async update(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateCarDto,
    ) {
        return this.carsService.update(id, req.user.userId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req, @Param('id') id: string) {
        await this.carsService.delete(id, req.user.userId);
    }
}