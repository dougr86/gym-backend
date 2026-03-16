import { Exclude, Expose } from 'class-transformer';
import { UserRole } from 'src/auth/constants/role.constants';
import { Organization } from 'src/organizations/entities/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'state_province', nullable: true })
  stateProvince: string; // e.g. 'CA' for California or 'SJ' for San Jose

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  // New: User's specific location (Defaults to null so we can inherit from Org in the UI)
  @Column({ name: 'country_code', type: 'varchar', length: 2, nullable: true })
  countryCode: string;

  // Standardized E.164 format
  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string; // e.g. '+12125551234'

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  // Use standard IANA timezone strings (e.g., 'UTC', 'America/New_York')
  @Column({ default: 'UTC' })
  timezone: string;

  // ISO 639-1 codes (e.g., 'en', 'es')
  @Column({ name: 'preferred_language', default: 'en', length: 5 })
  preferredLanguage: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  // Automatically set when the record is created
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Automatically updated every time you call save() on the entity
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
