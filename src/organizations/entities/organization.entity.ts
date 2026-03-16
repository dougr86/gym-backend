import { AuditableEntity } from 'src/common/base.entity';
import { Location } from 'src/locations/entities/location.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum OrgStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum OrgPlan {
  FREE = 'free',
  PLUS = 'plus',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('organizations')
export class Organization extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: OrgStatus,
    default: OrgStatus.ACTIVE,
  })
  status: OrgStatus;

  // New: Organization's legal/base country (e.g., 'CR')
  @Column({ name: 'country_code', type: 'varchar', length: 2, default: 'CR' })
  countryCode: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  // Standardized E.164 format
  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string; // e.g. '+12125551234'

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'state_province', nullable: true })
  stateProvince: string; // e.g. 'CA' for California or 'SJ' for San Jose

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    type: 'varchar',
    default: OrgPlan.FREE,
  })
  plan: OrgPlan;

  @Column({ name: 'tax_id', nullable: true })
  taxId: string;

  // We define this relationship so we can see all users belonging to an Org
  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Location, (location) => location.organization)
  locations: Location[];
}
