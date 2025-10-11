import { User } from 'src/users/users.entity';
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne,
    JoinColumn, Index
} from 'typeorm';

export enum ServiceType {
    NOT_SURE = 'not_sure',
    SIMPLE_WEBSITE = 'simple_website',
    STANDARD_WEBSITE = 'standard_website',
    INDIVIDUAL_WEBSITE = 'individual_website',
    SEO = 'seo',
}

@Entity('contact_requests')
export class ContactRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    // In PG per Migration auf CITEXT umstellen (case-insensitive Unique/Filter möglich)
    @Column()
    email: string;

    @Column({
        type: 'enum',
        enum: ServiceType,
        enumName: 'service_type', // Name des PG-Enum-Typs
        default: ServiceType.NOT_SURE,
    })
    serviceType: ServiceType;

    @Column('text')
    message: string;

    @Index()
    @Column({ default: false })
    prefersCallback: boolean;

    @Column({ nullable: true })
    phoneNumber: string | null;

    @Index()
    @Column({ default: false })
    isProcessed: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column('uuid', { nullable: true })
    userId: string | null;

    @ManyToOne(() => User, user => user.contactRequests, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'now()' })
    createdAt: Date;
}
