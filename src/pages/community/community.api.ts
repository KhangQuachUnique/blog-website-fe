// src/pages/community/community.api.ts
import axios from "../../config/axiosCustomize";

const COMMUNITY_ID = 1; // tạm thời fix id

// ====== Settings (giữ như cũ) ======
export async function getCommunitySettings() {
  return await axios.get(`/communities/${COMMUNITY_ID}`);
}

export async function updateCommunitySettings(payload: any) {
  return await axios.patch(`/communities/${COMMUNITY_ID}`, payload);
}

// ====== Members API ======

export type ApiRole = "ADMIN" | "MODERATOR" | "MEMBER";
export type ApiStatus = "ACTIVE" | "PENDING" | "BANNED";

export interface ApiCommunityMember {
  id: number;
  user: {
    id: number;
    username: string;
    avatarUrl?: string | null;
    joinAt?: string; // có thể không dùng
  };
  joinedAt: string;
  role: ApiRole;
  status: ApiStatus;
}

// Lấy tất cả members của community
export async function getCommunityMembers(): Promise<ApiCommunityMember[]> {
  const res = await axios.get(`/communities/${COMMUNITY_ID}/members`);
  return res.data.data;
}

// Đổi role (ADMIN / MODERATOR / MEMBER)
export async function updateMemberRole(memberId: number, role: ApiRole) {
  const res = await axios.patch(
    `/communities/${COMMUNITY_ID}/members/${memberId}/role`,
    { role }
  );
  return res.data.data;
}

// Đổi status (ACTIVE / PENDING / BANNED)
export async function updateMemberStatus(memberId: number, status: ApiStatus) {
  const res = await axios.patch(
    `/communities/${COMMUNITY_ID}/members/${memberId}/status`,
    { status }
  );
  return res.data.data;
}

// Kick member (xóa khỏi cộng đồng)
export async function deleteMember(memberId: number) {
  const res = await axios.delete(
    `/communities/${COMMUNITY_ID}/members/${memberId}`
  );
  return res.data.data;
}
