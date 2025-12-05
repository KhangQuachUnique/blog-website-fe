import axios from "../../../config/axiosCustomize";
import type { CommunitySettings } from "../../../types/community";

export const getCommunitySettings = async (communityId: number): Promise<CommunitySettings> => {
  const response = await axios.get(`/communities/${communityId}/settings`);
  return response;
}