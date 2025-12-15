// User roles
export const EUserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type EUserRole = typeof EUserRole[keyof typeof EUserRole];

export interface User {
  id: number;
  username: string;
  email: string;
  role?: EUserRole | string;
  avatarUrl?: string;
  displayName?: string;
}
