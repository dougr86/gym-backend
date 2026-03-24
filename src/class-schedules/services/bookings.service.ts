import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { Repository, DataSource } from 'typeorm';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingEntity, BookingStatus } from '../entities/booking.entity';
import {
  ClassScheduleEntity,
  ScheduleStatus,
} from '../entities/class-schedule.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(ClassScheduleEntity)
    private readonly scheduleRepo: Repository<ClassScheduleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(authUser: ActiveUser, dto: CreateBookingDto) {
    // 1. Find the class instance (Scoped to Organization)
    const schedule = await this.scheduleRepo.findOne({
      where: { id: dto.scheduleId, organizationId: authUser.organizationId },
    });

    if (!schedule) {
      throw new NotFoundException('Class schedule not found');
    }

    // 2. Validate availability
    if (schedule.status !== ScheduleStatus.SCHEDULED) {
      throw new BadRequestException('This class is not available for booking');
    }

    if (schedule.currentOccupancy >= schedule.maxCapacity) {
      throw new ConflictException('Class is fully booked');
    }

    // 3. Check for existing reservation
    const existing = await this.bookingRepo.findOne({
      where: {
        scheduleId: dto.scheduleId,
        userId: authUser.userId,
        status: BookingStatus.RESERVED,
      },
    });

    if (existing) {
      throw new ConflictException('User already has a reservation');
    }

    // 4. Atomic Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const booking = this.bookingRepo.create({
        ...dto,
        userId: authUser.userId,
        organizationId: authUser.organizationId,
      });

      await queryRunner.manager.save(booking);

      await queryRunner.manager.increment(
        ClassScheduleEntity,
        { id: dto.scheduleId },
        'currentOccupancy',
        1,
      );

      await queryRunner.commitTransaction();
      return booking;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(authUser: ActiveUser, id: string) {
    // Find booking scoped to the user and their organization
    const booking = await this.bookingRepo.findOne({
      where: { id, organizationId: authUser.organizationId },
    });

    if (!booking || booking.status === BookingStatus.CANCELLED) {
      throw new NotFoundException('Booking not found or already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      booking.status = BookingStatus.CANCELLED;
      await queryRunner.manager.save(booking);

      await queryRunner.manager.decrement(
        ClassScheduleEntity,
        { id: booking.scheduleId },
        'currentOccupancy',
        1,
      );

      await queryRunner.commitTransaction();
      return { message: 'Booking cancelled successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
