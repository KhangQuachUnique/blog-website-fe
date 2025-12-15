// User roles - match với backend enum
export const EUserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
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
