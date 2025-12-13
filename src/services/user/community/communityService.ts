import axios from "../../../config/axiosCustomize";
import type { CommunitySettings } from "../../../types/community";

export type CommunityRole = "ADMIN" | "MODERATOR" | "MEMBER";

export interface CommunityMember {
  id: number;
  role: CommunityRole;
  joinedAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string | null;
  };
}

export const getCommunitySettings = async (communityId: number): Promise<CommunitySettings> => {
  const response = await axios.get(`/communities/${communityId}/settings`);
  return response;
}

export const getCommunityMembers = (communityId: number) => {
  return axios.get<CommunityMember[], CommunityMember[]>(
    `/communities/${communityId}/members`
  );
};