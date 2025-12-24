// Interfaces for Community API responses and requests
// Generated for frontend/backend type sharing

export type ECommunityRoleString =
  | "ADMIN"
  | "MODERATOR"
  | "MEMBER"
  | "PENDING"
  | "BANNED";

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
  role: ECommunityRoleString;
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
  role: ECommunityRoleString;
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
  role: ECommunityRoleString | "NONE";
}

export interface ICommunityDetailResponse extends ICommunityResponse {
  requirePostApproval?: boolean;
  requireMemberApproval?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ICommunitySettingsResponse = ICommunityResponse;

export type IJoinStatus = "PENDING" | "JOINED";
export interface IJoinResponse {
  ok: boolean;
  role: ECommunityRoleString | "NONE";
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
