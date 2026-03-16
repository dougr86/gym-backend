import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateOwnerDto extends CreateUserDto {
  @IsBoolean()
  @IsOptional()
  useOrgAddress?: boolean;
}
