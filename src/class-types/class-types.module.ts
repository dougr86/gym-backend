import { Module } from '@nestjs/common';
import { ClassTypesService } from './class-types.service';
import { ClassTypesController } from './class-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassTypeEntity } from './entities/class-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassTypeEntity])],
  controllers: [ClassTypesController],
  providers: [ClassTypesService],
  exports: [ClassTypesService],
})
export class ClassTypesModule {}
