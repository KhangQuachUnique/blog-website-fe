// src/pages/community/community.api.ts
import axios from "../../config/axiosCustomize";

const COMMUNITY_ID = 1; // tạm thời fix id

export async function getCommunitySettings() {
  const res = await axios.get(`/communities/${COMMUNITY_ID}`);
  return res.data.data;
}

export async function updateCommunitySettings(payload: any) {
  const res = await axios.patch(`/communities/${COMMUNITY_ID}`, payload);
  return res.data.data;
}
