import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- 1. Import this
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // <--- 2. Import your Entity
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // 3. This registers the repository so UsersService can "inject" it
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export it so AuthModule can use it later!
})
export class UsersModule {}
