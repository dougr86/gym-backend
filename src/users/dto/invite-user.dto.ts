import { IsEnum, IsEmail, IsArray } from 'class-validator';
import { UserRole } from 'src/auth/constants/role.constants';

export class InviteUserDto {
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsEnum(UserRole)
  role: UserRole;
}
