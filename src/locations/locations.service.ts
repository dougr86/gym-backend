import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { LocationEntity } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationsRepository: Repository<LocationEntity>,
  ) {}

  async create(authUser: ActiveUser, createLocationDto: CreateLocationDto) {
    const location = this.locationsRepository.create({
      ...createLocationDto,
      organizationId: authUser.organizationId,
      createdBy: authUser.userId,
      updatedBy: authUser.userId,
    });

    return await this.locationsRepository.save(location);
  }

  async findAll(authUser: ActiveUser) {
    return await this.locationsRepository.find({
      select: {
        id: true,
        name: true,
        addressLine1: true,
        city: true,
        postalCode: true,
        phone: true,
        isActive: true,
      },
      where: {
        organizationId: authUser.organizationId,
      },
    });
  }

  async findOne(authUser: ActiveUser, id: string) {
    const location = await this.locationsRepository.findOne({
      where: {
        id,
        organizationId: authUser.organizationId,
      },
    });

    if (!location) {
      throw new NotFoundException(
        `Location with ID ${id} not found in your organization`,
      );
    }

    return location;
  }

  async update(
    authUser: ActiveUser,
    id: string,
    updateLocationDto: UpdateLocationDto,
  ) {
    // We reuse findOne to handle the 404 and Organization check automatically
    const location = await this.findOne(authUser, id);

    const updatedLocation = this.locationsRepository.merge(location, {
      ...updateLocationDto,
      updatedBy: authUser.userId,
    });

    return await this.locationsRepository.save(updatedLocation);
  }

  async remove(authUser: ActiveUser, id: string) {
    const location = await this.findOne(authUser, id);

    location.deletedBy = authUser.userId;

    // softRemove triggers the @DeleteDateColumn in your AuditableEntity
    return await this.locationsRepository.softRemove(location);
  }
}
