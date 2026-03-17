import { UserRole } from '../constants/role.constants';

export interface ActiveUser {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}
