import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserEntity, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersCronService {
  private readonly logger = new Logger(UsersCronService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Automated Identity Lifecycle Guard
   * Runs daily at midnight to permanently evict stale ghost invitation rows
   * that have been stuck in a PENDING state for more than 60 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeStaleInvitations(): Promise<void> {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    this.logger.log(
      `Executing automated cron cleanup pipeline for stale invitations created before: ${sixtyDaysAgo.toISOString()}`,
    );

    try {
      const result = await this.usersRepository.delete({
        status: UserStatus.PENDING,
        createdAt: LessThan(sixtyDaysAgo),
      });

      this.logger.log(
        `Automated invitation cleanup completed successfully. Evicted rows: ${result.affected || 0}`,
      );
    } catch (error) {
      this.logger.error(
        'Critical failure executed inside the stale invitation cron purge runner:',
        error,
      );
    }
  }
}
