import { ClassTypeEntity } from 'src/class-types/entities/class-type.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { OrganizationEntity } from 'src/organizations/entities/organization.entity';
import { RoomEntity } from 'src/rooms/entities/room.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ScheduleConfigurationEntity } from './schedule-configuration.entity';

export enum ScheduleStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('class_schedules')
@Index(['organizationId', 'startTime']) // For fast calendar filtering
export class ClassScheduleEntity extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The link to the "Parent" rule
  @Column({ name: 'config_id', nullable: true })
  configId: string;

  @ManyToOne(() => ScheduleConfigurationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'config_id' })
  configuration: ScheduleConfigurationEntity;

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

  // --- Specific Event Data ---

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'int' })
  maxCapacity: number;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  status: ScheduleStatus;

  @Column({ name: 'is_special_event', default: false })
  isSpecialEvent: boolean;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
