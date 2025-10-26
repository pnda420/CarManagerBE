// tuning/tuning.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TuningGroup } from './tuning-group.entity';
import { TuningPart } from './tuning-part.entity';
import { CarsService } from '../cars/cars.service';
import {
  CreateTuningGroupDto,
  UpdateTuningGroupDto,
  CreateTuningPartDto,
  UpdateTuningPartDto,
} from './tuning.dto';

@Injectable()
export class TuningService {
  constructor(
    @InjectRepository(TuningGroup)
    private readonly groupRepo: Repository<TuningGroup>,
    @InjectRepository(TuningPart)
    private readonly partRepo: Repository<TuningPart>,
    private readonly carsService: CarsService,
  ) {}

  // ========== TuningGroup Methods ==========

  async createGroup(
    carId: string,
    userId: string,
    dto: CreateTuningGroupDto,
  ): Promise<TuningGroup> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    const group = this.groupRepo.create({
      ...dto,
      carId,
    });

    return this.groupRepo.save(group);
  }

  async findAllGroups(carId: string, userId: string): Promise<TuningGroup[]> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    return this.groupRepo.find({
      where: { carId, deletedAt: null },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
      relations: ['parts'],
    });
  }

  async findOneGroup(
    groupId: string,
    carId: string,
    userId: string,
  ): Promise<TuningGroup> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    const group = await this.groupRepo.findOne({
      where: { id: groupId, carId, deletedAt: null },
      relations: ['parts'],
    });

    if (!group) {
      throw new NotFoundException(`TuningGroup with ID ${groupId} not found`);
    }

    return group;
  }

  async updateGroup(
    groupId: string,
    carId: string,
    userId: string,
    dto: UpdateTuningGroupDto,
  ): Promise<TuningGroup> {
    const group = await this.findOneGroup(groupId, carId, userId);
    Object.assign(group, dto);
    return this.groupRepo.save(group);
  }

  async deleteGroup(groupId: string, carId: string, userId: string): Promise<void> {
    const group = await this.findOneGroup(groupId, carId, userId);
    // Soft delete
    group.deletedAt = new Date();
    await this.groupRepo.save(group);
  }

  // ========== TuningPart Methods ==========

  async createPart(
    carId: string,
    userId: string,
    dto: CreateTuningPartDto,
  ): Promise<TuningPart> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    // Verify group belongs to car
    const group = await this.groupRepo.findOne({
      where: { id: dto.groupId, carId, deletedAt: null },
    });

    if (!group) {
      throw new NotFoundException(`TuningGroup with ID ${dto.groupId} not found`);
    }

    const part = this.partRepo.create({
      ...dto,
      carId,
      statusChangedAt: new Date(),
    });

    return this.partRepo.save(part);
  }

  async findAllParts(carId: string, userId: string): Promise<TuningPart[]> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    return this.partRepo.find({
      where: { carId, deletedAt: null },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findPartsByGroup(
    groupId: string,
    carId: string,
    userId: string,
  ): Promise<TuningPart[]> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    return this.partRepo.find({
      where: { groupId, carId, deletedAt: null },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOnePart(
    partId: string,
    carId: string,
    userId: string,
  ): Promise<TuningPart> {
    // Verify car ownership
    await this.carsService.findOne(carId, userId);

    const part = await this.partRepo.findOne({
      where: { id: partId, carId, deletedAt: null },
    });

    if (!part) {
      throw new NotFoundException(`TuningPart with ID ${partId} not found`);
    }

    return part;
  }

  async updatePart(
    partId: string,
    carId: string,
    userId: string,
    dto: UpdateTuningPartDto,
  ): Promise<TuningPart> {
    const part = await this.findOnePart(partId, carId, userId);

    // Update statusChangedAt if status changed
    if (dto.status && dto.status !== part.status) {
      Object.assign(part, dto, { statusChangedAt: new Date() });
    } else {
      Object.assign(part, dto);
    }

    return this.partRepo.save(part);
  }

  async deletePart(partId: string, carId: string, userId: string): Promise<void> {
    const part = await this.findOnePart(partId, carId, userId);
    // Soft delete
    part.deletedAt = new Date();
    await this.partRepo.save(part);
  }
}