// src/services/user/community/communityService.ts
import axios from "../../../config/axiosCustomize";
import type {
  ECommunityRole,
  EManageCommunityRole,
  ICommunityDetailResponse,
  ICommunityResponse,
  ICreateCommunityDto,
  IMemberResponse,
  IUpdateCommunityDto,
} from "../../../types/community";

// Lấy danh sách community của user hiện tại
export async function getMyCommunities(): Promise<ICommunityResponse[]> {
  const res = await axios.get("/communities/my");
  return res;
}

// Tạo community mới
export async function createCommunity(
  payload: ICreateCommunityDto
): Promise<ICommunityResponse> {
  const res = await axios.post("/communities", payload);
  return res;
}

// Settings giữ như bạn đang dùng
export const getCommunitySettings = async (
  communityId: number
): Promise<ICommunityDetailResponse> => {
  return axios.get(`/communities/${communityId}/settings`);
};

// ✅ Update settings (dùng cho trang /manage/settings)
export const updateCommunitySettings = (
  communityId: number,
  payload: IUpdateCommunityDto
) => {
  return axios.patch(`/communities/${communityId}`, payload);
};

// Members (public tab): BE mặc định Not(PENDING) nên OK
export const getCommunityMembers = (communityId: number) => {
  return axios.get<IMemberResponse[], IMemberResponse[]>(
    `/communities/${communityId}/members`
  );
};

// ✅ Manage: có filter role (bao gồm PENDING)
export const getManageCommunityMembers = (
  communityId: number,
  role?: EManageCommunityRole
) => {
  return axios.get<IMemberResponse[], IMemberResponse[]>(
    `/communities/${communityId}/members`,
    { params: role ? { role } : undefined }
  );
};

// ✅ Approve / Change role
export const updateCommunityMemberRole = (
  communityId: number,
  memberId: number,
  role: ECommunityRole // chỉ cho set 3 role chính
) => {
  return axios.patch(`/communities/${communityId}/members/${memberId}/role`, {
    role,
  });
};

// ✅ Kick / Reject
export const removeCommunityMember = (
  communityId: number,
  memberId: number,
  opts?: { ban?: boolean }
) => {
  const ban = opts?.ban ?? true; // mặc định kick = ban
  return axios.delete(`/communities/${communityId}/members/${memberId}`, {
    params: { ban: ban ? 1 : 0 }, // ✅ luôn gửi 1/0
  });
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
