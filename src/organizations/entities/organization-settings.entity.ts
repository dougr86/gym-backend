import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../common/entities/auditable.entity'; // Adjust path if needed
import { OrganizationEntity } from './organization.entity';

@Entity('organization_settings')
export class OrganizationSettingsEntity extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 1:1 Bidirectional Relation pointing back to Organization
  @OneToOne(() => OrganizationEntity, (organization) => organization.settings, {
    onDelete: 'CASCADE', // If the gym is deleted, wipe its security settings automatically
  })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  // 🟢 Card 4: Security & Access Rules
  @Column({ name: 'allow_admin_tax_id_edit', type: 'boolean', default: false })
  allowAdminTaxIdEdit: boolean;

  @Column({ name: 'session_timeout_minutes', type: 'int', default: 60 })
  sessionTimeoutMinutes: number;

  // 🟢 Card 5: Password Complexity & Rotation Policy
  @Column({ name: 'password_min_length', type: 'int', default: 6 })
  passwordMinLength: number;

  @Column({
    name: 'password_require_uppercase',
    type: 'boolean',
    default: false,
  })
  passwordRequireUppercase: boolean;

  @Column({ name: 'password_require_numbers', type: 'boolean', default: false })
  passwordRequireNumbers: boolean;

  @Column({ name: 'password_require_special', type: 'boolean', default: false })
  passwordRequireSpecial: boolean;

  @Column({ name: 'password_max_age_months', type: 'int', default: 0 }) // 0 = Never Expire
  passwordMaxAgeMonths: number;
}
