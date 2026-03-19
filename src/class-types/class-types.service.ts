import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassTypeDto } from './dto/create-class-type.dto';
import { UpdateClassTypeDto } from './dto/update-class-type.dto';
import { ActiveUser } from 'src/auth/interfaces/active-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassTypeEntity } from './entities/class-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassTypesService {
  constructor(
    @InjectRepository(ClassTypeEntity)
    private classTypeRepository: Repository<ClassTypeEntity>,
  ) {}

  async create(authUser: ActiveUser, createClassTypeDto: CreateClassTypeDto) {
    const classType = this.classTypeRepository.create({
      ...createClassTypeDto,
      organizationId: authUser.organizationId,
      createdBy: authUser.userId,
    });
    return await this.classTypeRepository.save(classType);
  }

  async findAll(authUser: ActiveUser) {
    return this.classTypeRepository.find({
      where: {
        organizationId: authUser.organizationId,
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findOne(authUser: ActiveUser, id: string) {
    const classType = await this.classTypeRepository.findOne({
      where: { id, organizationId: authUser.organizationId },
    });

    if (!classType) {
      throw new NotFoundException(`Class type with ID ${id} not found`);
    }
    return classType;
  }

  async update(
    authUser: ActiveUser,
    id: string,
    updateClassTypeDto: UpdateClassTypeDto,
  ) {
    const classType = await this.findOne(authUser, id);
    Object.assign(classType, {
      ...updateClassTypeDto,
      updatedBy: authUser.userId,
    });

    return await this.classTypeRepository.save(classType);
  }

  async remove(authUser: ActiveUser, id: string) {
    // Soft delete by deactivating so we don't break existing schedules
    const classType = await this.findOne(authUser, id);
    classType.isActive = false;
    classType.updatedBy = authUser.userId;

    return await this.classTypeRepository.save(classType);
  }
}
