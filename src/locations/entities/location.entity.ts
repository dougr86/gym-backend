import { AuditableEntity } from 'src/common/base.entity';
import { Organization } from 'src/organizations/entities/organization.entity';
import { Room } from 'src/rooms/entities/room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('locations')
export class Location extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'address_line1' })
  addressLine1: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Link to Organization
  @ManyToOne(() => Organization, (org) => org.locations)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'organization_id' })
  organizationId: string;

  // Link to Rooms
  @OneToMany(() => Room, (room) => room.location)
  rooms: Room[];
}
