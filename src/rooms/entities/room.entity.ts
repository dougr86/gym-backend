import { AuditableEntity } from 'src/common/base.entity';
import { Location } from 'src/locations/entities/location.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('rooms')
export class Room extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "Yoga Studio", "Main Weight Floor", "Spinning Room"

  @Column({ nullable: true })
  description: string;

  // Crucial for future booking/scheduling logic
  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Each Room belongs to exactly one Location
  @ManyToOne(() => Location, (location) => location.rooms, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'location_id' })
  locationId: string;
}
