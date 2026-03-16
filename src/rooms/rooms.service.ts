import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { Location } from 'src/locations/entities/location.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private readonly roomsRepository: Repository<Room>,
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
  ) {}

  async create(authUser: ActiveUser, createRoomDto: CreateRoomDto) {
    // 1. Security Check: Ensure the location belongs to the user's organization
    const location = await this.locationsRepository.findOne({
      where: {
        id: createRoomDto.locationId,
        organizationId: authUser.organizationId,
      },
    });

    if (!location) {
      throw new NotFoundException(
        'Target location not found in your organization',
      );
    }

    // 2. Create with Audit trail
    const room = this.roomsRepository.create({
      ...createRoomDto,
      createdBy: authUser.userId,
      updatedBy: authUser.userId,
    });

    return await this.roomsRepository.save(room);
  }

  async findAll(authUser: ActiveUser) {
    return await this.roomsRepository.find({
      select: {
        id: true,
        name: true,
        isActive: true,
        capacity: true, // Included capacity as it's useful for the UI
        locationId: true,
      },
      where: {
        location: {
          organizationId: authUser.organizationId,
        },
      },
      relations: ['location'],
    });
  }

  async findOne(authUser: ActiveUser, id: string) {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: ['location'],
    });

    if (!room || room.location.organizationId !== authUser.organizationId) {
      throw new NotFoundException(`Room #${id} not found`);
    }

    return room;
  }

  async update(authUser: ActiveUser, id: string, updateRoomDto: UpdateRoomDto) {
    const room = await this.findOne(authUser, id); // Reuse findOne for security check

    if (
      updateRoomDto.locationId &&
      updateRoomDto.locationId !== room.locationId
    ) {
      const locationExists = await this.locationsRepository.findOne({
        where: {
          id: updateRoomDto.locationId,
          organizationId: authUser.organizationId,
        },
      });
      if (!locationExists) {
        throw new NotFoundException(
          'Target location not found in your organization',
        );
      }
    }

    const updatedRoom = this.roomsRepository.merge(room, {
      ...updateRoomDto,
      updatedBy: authUser.userId,
    });

    return await this.roomsRepository.save(updatedRoom);
  }

  async remove(authUser: ActiveUser, id: string) {
    const room = await this.findOne(authUser, id); // Security check

    // We use softRemove to trigger the BaseEntity's deletedAt and keep history
    return await this.roomsRepository.softRemove(room);
  }
}
