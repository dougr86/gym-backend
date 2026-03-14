export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OWNER = 'owner',
  INSTRUCTOR = 'instructor',
  ASSISTANT = 'assistant',
  STUDENT = 'student',
}

export const RolePriority: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.OWNER]: 80,
  [UserRole.ADMIN]: 60,
  [UserRole.INSTRUCTOR]: 40,
  [UserRole.ASSISTANT]: 20,
  [UserRole.STUDENT]: 0,
};
