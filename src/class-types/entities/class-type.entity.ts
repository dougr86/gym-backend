import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationEntity } from 'src/organizations/entities/organization.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('class_types')
export class ClassTypeEntity extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "CrossFit WOD", "Hatha Yoga"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'default_duration', default: 60 })
  defaultDuration: number; // Duration in minutes

  @Column({ nullable: true })
  intensity: string; // e.g., "Beginner", "High Intensity", "Recovery"

  @Column({ name: 'requires_booking', default: false })
  requiresBooking: boolean; // false = Yoga style, true = Pilates style

  @Column({ name: 'allow_waitlist', default: false })
  allowWaitlist: boolean;

  @Column({ name: 'default_max_capacity', default: 20 })
  defaultMaxCapacity: number;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ default: true })
  isActive: boolean;
}
