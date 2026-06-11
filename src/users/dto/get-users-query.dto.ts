import { IntersectionType } from '@nestjs/mapped-types';
import { PageInfo } from 'src/common/dto/page-info.dto';
import { UserFilterDto } from './user-filter.dto';

// This dynamically combines all fields, validation decorators,
// and transformation rules from both parent classes into a single schema.
export class GetUsersQueryDto extends IntersectionType(
  PageInfo,
  UserFilterDto,
) {}
