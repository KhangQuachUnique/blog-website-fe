// src/pages/community/community.api.ts
import axios from "../../config/axiosCustomize";

const COMMUNITY_ID = 1; // tạm thời fix id

export async function getCommunitySettings() {
  return await axios.get(`/communities/${COMMUNITY_ID}`);
}

export async function updateCommunitySettings(payload: any) {
  return await axios.patch(`/communities/${COMMUNITY_ID}`, payload);
}
