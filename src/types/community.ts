export interface CommunitySettings {
  id: number;
  name: string;
  description: string;
  thumbnailUrl?: string | null;
  isPublic: boolean;
  requirePostApproval: boolean;
  requireMemberApproval: boolean;
  createdAt: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER" | "PENDING" | "NONE";
  memberCount: number;
}

export type MyCommunityRole = "ADMIN" | "MODERATOR" | "MEMBER";

export interface Community {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  isPublic: boolean;
  memberCount: number;
  role: MyCommunityRole;
}

export interface CreateCommunityPayload {
  name: string;
  description: string;
  thumbnailUrl: string;
  isPublic: boolean;
  requirePostApproval?: boolean;
  requireMemberApproval?: boolean;
}
