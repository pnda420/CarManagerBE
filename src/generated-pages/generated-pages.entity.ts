import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('generated_pages')
export class GeneratedPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.generatedPages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string; // z.B. "Homepage für Restaurant", "Landingpage Startup"

  @Column('text')
  pageContent: string; // Der generierte HTML/Code als langer String

  @Column({ nullable: true })
  description: string; // Optional: Kurzbeschreibung was generiert wurde

  @Column({ default: false })
  isPublished: boolean; // Falls du später Live/Draft unterscheiden willst

  @Column({ nullable: true })
  previewUrl: string; // Falls du Preview-Links anbietest

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}