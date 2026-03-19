import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { ClassScheduleEntity } from './class-schedule.entity';
import { UserEntity } from 'src/users/entities/user.entity';

export enum BookingStatus {
  RESERVED = 'reserved', // Confirmed spot
  ATTENDED = 'attended', // Checked in at the gym
  CANCELLED = 'cancelled', // Student cancelled
  WAITLISTED = 'waitlisted', // Waiting for a spot to open
}

@Entity('bookings')
export class BookingEntity extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'schedule_id' })
  scheduleId: string;

  @ManyToOne(() => ClassScheduleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: ClassScheduleEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.RESERVED,
  })
  status: BookingStatus;

  @Column({ name: 'organization_id' })
  organizationId: string;
}
