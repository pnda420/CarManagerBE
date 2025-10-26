// cars/cars.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './cars.entity';
import { CreateCarDto, UpdateCarDto } from './cars.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepo: Repository<Car>,
  ) {}

  async create(userId: string, dto: CreateCarDto): Promise<Car> {
    const car = this.carRepo.create({
      ...dto,
      userId,
      mileageUpdatedAt: new Date(),
    });

    return this.carRepo.save(car);
  }

  async findAll(userId: string): Promise<Car[]> {
    return this.carRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAll(): Promise<Car[]> {
    return this.carRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Car> {
    const car = await this.carRepo.findOne({
      where: { id, userId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async findOneGlobal(id: string): Promise<Car> {
    const car = await this.carRepo.findOne({
      where: { id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async update(id: string, userId: string, dto: UpdateCarDto): Promise<Car> {
    const car = await this.findOne(id, userId);

    // Update mileageUpdatedAt if mileage changed
    if (dto.mileageKm !== undefined && dto.mileageKm !== car.mileageKm) {
      Object.assign(car, dto, { mileageUpdatedAt: new Date() });
    } else {
      Object.assign(car, dto);
    }

    return this.carRepo.save(car);
  }

  async delete(id: string, userId: string): Promise<void> {
    const car = await this.findOne(id, userId);
    await this.carRepo.remove(car);
  }
}