import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCommunitySettings,
  getMyCommunities,
  createCommunity,
  updateCommunitySettings,
} from "../services/user/community/communityService";

import type { UpdateCommunitySettingsPayload } from "../services/user/community/communityService";

export const useGetCommunitySettings = (communityId: number) => {
  return useQuery({
    queryKey: ["communitySettings", communityId],
    queryFn: () => getCommunitySettings(communityId),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};

export const useGetMyCommunities = () => {
  return useQuery({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
  });
};

/**
 * @deprecated Không dùng userId nữa. Dùng `useGetMyCommunities()`.
 */
export const useGetCommunitiesByUserId = (userId: number) => {
  return useQuery({
    queryKey: ["myCommunities"],
    queryFn: getMyCommunities,
    enabled: Number.isFinite(userId) && userId > 0,
  });
};

export const useUpdateCommunitySettings = (communityId: number) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommunitySettingsPayload) =>
      updateCommunitySettings(communityId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
};

export const useCreateCommunity = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
};
