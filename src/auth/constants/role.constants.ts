export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OWNER = 'owner',
  ASSISTANT = 'assistant',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

export const RolePriority: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.OWNER]: 80,
  [UserRole.ADMIN]: 60,
  [UserRole.ASSISTANT]: 40,
  [UserRole.INSTRUCTOR]: 20,
  [UserRole.STUDENT]: 0,
};
