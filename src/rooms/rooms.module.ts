import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { LocationEntity } from 'src/locations/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, LocationEntity])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
