import { useQuery } from "@tanstack/react-query";
import {
  getCommunitySettings,
  getMyCommunities,
} from "../services/user/community/communityService";

export const useGetCommunitySettings = (communityId: number) => {
  return useQuery({
    queryKey: ["communitySettings", communityId],
    queryFn: () => getCommunitySettings(communityId),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};

export const useGetCommunitiesByUserId = (userId: number) => {
  return useQuery({
    queryKey: ["userCommunities", userId],
    queryFn: () => getMyCommunities(),
    enabled: Number.isFinite(userId) && userId > 0,
  });
};
