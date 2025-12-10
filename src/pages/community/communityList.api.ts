import axios from "../../config/axiosCustomize";

export type MyCommunityRole = "ADMIN" | "MODERATOR" | "MEMBER";

export interface MyCommunity {
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

// Lấy danh sách community của user hiện tại
export async function getMyCommunities(): Promise<MyCommunity[]> {
  const res = await axios.get("/communities/my");
  return res; // ✔ axiosCustomize đã unwrap → trả về mảng luôn
}

// Tạo community mới
export async function createCommunity(
  payload: CreateCommunityPayload
): Promise<MyCommunity> {
  const res = await axios.post("/communities", payload);
  return res; // ✔ unwrap rồi
}
