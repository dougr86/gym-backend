import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationEntity } from 'src/organizations/entities/organization.entity';
import { AuditableEntity } from 'src/common/auditable.entity';

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

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ default: true })
  isActive: boolean;
}
