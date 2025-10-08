import { ContactRequest } from 'src/contact-requests/contact-requests.entity';
import { GeneratedPage } from 'src/generated-pages/generated-pages.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string; // Wichtig: Später mit bcrypt hashen!

  @Column({ default: false })
  wantsNewsletter: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GeneratedPage, page => page.user)
  generatedPages: GeneratedPage[];

  @OneToMany(() => ContactRequest, request => request.user)
  contactRequests: ContactRequest[];
}