import { useQuery } from "@tanstack/react-query";
import { getCommunitySettings } from "../services/user/community/communityService";

export const useGetCommunitySettings = (communityId: number) => {
  return useQuery({
    queryKey: ["communitySettings", communityId],
    queryFn: () => getCommunitySettings(communityId),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};
