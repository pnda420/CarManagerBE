// cars/cars.entity.ts
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
import { User } from '../users/users.entity';
import { TuningGroup } from 'src/tuning/tuning-group.entity';

export type Visibility = 'private' | 'public';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg' | 'cng' | 'other';
export type Induction = 'none' | 'turbo' | 'supercharger' | 'electric' | 'other';
export type Drivetrain = 'fwd' | 'rwd' | 'awd';
export type Transmission = 'manual' | 'automatic' | 'dsg' | 'cvt' | 'other';
export type BodyType = 'sedan' | 'wagon' | 'coupe' | 'convertible' | 'suv' | 'van' | 'pickup' | 'hatchback' | 'other';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => TuningGroup, (group) => group.car)
  tuningGroups: TuningGroup[];

  // Basics
  @Column()
  name: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  modelYear: number;

  @Column({ nullable: true })
  licensePlate: string;

  @Column({ nullable: true })
  vin: string;

  // Performance
  @Column({ type: 'int' })
  horsepowerPs: number;

  @Column({ type: 'int', nullable: true })
  torqueNm: number;

  @Column({ type: 'int', nullable: true })
  displacementCc: number;

  @Column({ type: 'varchar' })
  fuel: FuelType;

  @Column({ type: 'varchar', nullable: true })
  induction: Induction;

  @Column({ type: 'varchar', nullable: true })
  drivetrain: Drivetrain;

  @Column({ type: 'varchar', nullable: true })
  transmission: Transmission;

  @Column({ type: 'int', nullable: true })
  gears: number;

  // Body/weights
  @Column({ type: 'int', nullable: true })
  kerbWeightKg: number;

  @Column({ type: 'int', nullable: true })
  doors: number;

  @Column({ type: 'int', nullable: true })
  seats: number;

  @Column({ type: 'varchar', nullable: true })
  bodyType: BodyType;

  // Mileage & maintenance
  @Column({ type: 'int' })
  mileageKm: number;

  @Column({ type: 'timestamptz' })
  mileageUpdatedAt: Date;

  @Column({ type: 'date', nullable: true })
  nextTuvDate: string;

  @Column({ type: 'date', nullable: true })
  nextServiceDate: string;

  @Column({ type: 'int', nullable: true })
  nextServiceKm: number;

  // Stats
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  powerToWeightPsPerKg: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  zeroToHundredS: number;

  @Column({ type: 'int', nullable: true })
  topSpeedKmh: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  consumptionLPer100km: number;

  // Media (JSON)
  @Column({ type: 'jsonb', nullable: true })
  images: { id: string; image: string }[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}