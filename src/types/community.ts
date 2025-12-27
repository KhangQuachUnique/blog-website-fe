// Interfaces for Community API responses and requests
// Generated for frontend/backend type sharing
export type ECommunityRole = "ADMIN" | "MODERATOR" | "MEMBER";
export type EManageCommunityRole = ECommunityRole | "PENDING";

export interface ICreateCommunityDto {
  name: string;
  description: string;
  thumbnailUrl: string;
  isPublic: boolean;
  requirePostApproval?: boolean;
  requireMemberApproval?: boolean;
}

export type IUpdateCommunityDto = Partial<ICreateCommunityDto>;

export interface IUpdateMemberRoleDto {
  role: ECommunityRole;
}

export interface IUserSummary {
  id: number;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isPrivate?: boolean;
  joinAt?: string; // ISO date
}

export interface IMemberResponse {
  id: number; // membership id
  role: EManageCommunityRole;
  joinedAt?: string; // ISO date
  user: IUserSummary;
}

export interface ICommunityResponse {
  id: number;
  name: string;
  description: string;
  thumbnailUrl?: string | null;
  isPublic: boolean;
  memberCount: number;
  role: EManageCommunityRole | "NONE";
}

export interface ICommunityDetailResponse extends ICommunityResponse {
  requirePostApproval?: boolean;
  requireMemberApproval?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isBanned?: boolean;
}

export type ICommunitySettingsResponse = ICommunityResponse;

export type IJoinStatus = "PENDING" | "JOINED";
export interface IJoinResponse {
  ok: boolean;
  role: EManageCommunityRole | "NONE";
  status: IJoinStatus;
}

export interface ILeaveResponse {
  left: true;
}
export interface IDeleteResponse {
  deleted: true;
}

export interface IMembersListResponse {
  items: IMemberResponse[];
  total?: number;
}
