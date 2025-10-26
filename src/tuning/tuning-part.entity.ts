// tuning/tuning-part.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { TuningGroup } from './tuning-group.entity';

export type ModStatus = 'planned' | 'ordered' | 'installed' | 'discarded';

@Entity('tuning_parts')
export class TuningPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  carId: string;

  @Index()
  @Column()
  groupId: string;

  @ManyToOne(() => TuningGroup, (group) => group.parts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: TuningGroup;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  status: ModStatus;

  @Column({ type: 'int', nullable: true })
  priority: number;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPriceEur: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  laborPriceEur: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPriceEur: number;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  statusChangedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}