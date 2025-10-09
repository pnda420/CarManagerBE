import { User } from 'src/users/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum ServiceType {
    NOT_SURE = 'not_sure',
    SIMPLE_WEBSITE = 'simple_website',
    STANDARD_WEBSITE = 'standard_website',
    INDIVIDUAL_WEBSITE = 'individual_website',
    SEO = 'seo'
}

@Entity('contact_requests')
export class ContactRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({
        type: 'text',
        enum: ServiceType,
        default: ServiceType.NOT_SURE
    })
    serviceType: ServiceType;

    @Column('text')
    message: string; // "Worum geht's?"

    @Column({ default: false })
    prefersCallback: boolean; // "Lieber Rückruf statt E-Mail?"

    @Column({ nullable: true })
    phoneNumber: string; // Falls Rückruf gewünscht

    @Column({ default: false })
    isProcessed: boolean; // Für deine Verwaltung

    @Column({ nullable: true })
    notes: string; // Interne Notizen für dich

    @Column({ nullable: true })
    userId: string; // Optional: Falls eingeloggter User anfrage stellt

    @ManyToOne(() => User, user => user.contactRequests, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}