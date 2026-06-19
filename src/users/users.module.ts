import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- 1. Import this
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity'; // <--- 2. Import your Entity
import { AuthModule } from 'src/auth/auth.module';
import { OrganizationEntity } from 'src/organizations/entities/organization.entity';
import { UsersCronService } from './users-cron.service';

@Module({
  imports: [
    // 3. This registers the repository so UsersService can "inject" it
    TypeOrmModule.forFeature([UserEntity, OrganizationEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersCronService],
  exports: [UsersService], // Export it so AuthModule can use it later!
})
export class UsersModule {}
