import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(
  OmitType(CreateOrganizationDto, ['owner'] as const),
) {}
