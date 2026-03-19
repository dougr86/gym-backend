import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClassTypeEntity } from 'src/class-types/entities/class-type.entity';
import { RoomEntity } from 'src/rooms/entities/room.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrganizationEntity } from 'src/organizations/entities/organization.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('schedule_configurations')
export class ScheduleConfigurationEntity extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_type_id' })
  classTypeId: string;

  @ManyToOne(() => ClassTypeEntity)
  @JoinColumn({ name: 'class_type_id' })
  classType: ClassTypeEntity;

  @Column({ name: 'room_id' })
  roomId: string;

  @ManyToOne(() => RoomEntity)
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity;

  @Column({ name: 'instructor_id' })
  instructorId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserEntity;

  // --- Recurrence Pattern ---

  @Column('int', { array: true, name: 'days_of_week' })
  daysOfWeek: number[]; // [1, 2, 3, 4, 5] for Mon-Fri

  @Column({ type: 'time' })
  startTime: string; // "06:00:00"

  @Column({ type: 'time' })
  endTime: string; // "07:00:00"

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date', nullable: true })
  endDate: Date | null;

  // --- ---

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ default: true })
  isActive: boolean;
}
