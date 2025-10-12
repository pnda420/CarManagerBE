import { User } from 'src/users/users.entity';
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index
} from 'typeorm';

@Entity('generated_pages')
export class GeneratedPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, user => user.generatedPages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string; // z.B. "Homepage für Restaurant", "Landingpage Startup"

  @Column()
  contactEmail: string;

  @Column('text')
  pageContent: string; // Generierter HTML/Code (lang)

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'text', nullable: true })
  previewUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}
