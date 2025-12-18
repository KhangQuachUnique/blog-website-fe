// src/services/user/community/communityService.ts
import axios from "../../../config/axiosCustomize";
import type { CommunitySettings } from "../../../types/community";

export type CommunityRole = "ADMIN" | "MODERATOR" | "MEMBER";
export type ManageCommunityRole = CommunityRole | "PENDING";

export interface CommunityMember {
  id: number;
  role: ManageCommunityRole; // ✅ quản lý có PENDING
  joinedAt: string;
  user: { id: number; username: string; avatarUrl?: string | null };
}

// Settings giữ như bạn đang dùng
export const getCommunitySettings = async (
  communityId: number
): Promise<CommunitySettings> => {
  return axios.get(`/communities/${communityId}/settings`);
};

// Members (public tab): BE mặc định Not(PENDING) nên OK
export const getCommunityMembers = (communityId: number) => {
  return axios.get<CommunityMember[], CommunityMember[]>(
    `/communities/${communityId}/members`
  );
};

// ✅ Manage: có filter role (bao gồm PENDING)
export const getManageCommunityMembers = (
  communityId: number,
  role?: ManageCommunityRole
) => {
  return axios.get<CommunityMember[], CommunityMember[]>(
    `/communities/${communityId}/members`,
    { params: role ? { role } : undefined }
  );
};

// ✅ Approve / Change role
export const updateCommunityMemberRole = (
  communityId: number,
  memberId: number,
  role: CommunityRole // chỉ cho set 3 role chính
) => {
  return axios.patch(`/communities/${communityId}/members/${memberId}/role`, {
    role,
  });
};

// ✅ Kick / Reject
export const removeCommunityMember = (communityId: number, memberId: number) => {
  return axios.delete(`/communities/${communityId}/members/${memberId}`);
};

// ✅ Leave community (rời cộng đồng)
export const leaveCommunity = (communityId: number) => {
  return axios.delete(`/communities/${communityId}/leave`);
};

// ✅ Delete community (xóa cộng đồng)
export const deleteCommunity = (communityId: number) => {
  return axios.delete(`/communities/${communityId}`);
};

// ✅ Join community
export const joinCommunity = (communityId: number) => {
  return axios.post(`/communities/${communityId}/join`);
};
