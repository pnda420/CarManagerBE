// tuning/tuning-group.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { Car } from '../cars/cars.entity';
import { TuningPart } from './tuning-part.entity';

@Entity('tuning_groups')
export class TuningGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  carId: string;

  @ManyToOne(() => Car, (car) => car.tuningGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carId' })
  car: Car;

  @OneToMany(() => TuningPart, (part) => part.group)
  parts: TuningPart[];

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetEur: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}