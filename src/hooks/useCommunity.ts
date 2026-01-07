import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCommunitySettings,
  getMyCommunities,
  createCommunity,
  updateCommunitySettings,
} from "../services/user/community/communityService";

import type { IUpdateCommunityDto } from "../types/community";
import { useToast } from "../contexts/toast";

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
  const {showToast} = useToast();

  return useMutation({
    mutationFn: (payload: IUpdateCommunityDto) =>
      updateCommunitySettings(communityId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },

    onError: (error) => {
      showToast({
        type: "error",
        message: (error as Error).message || "Đã có lỗi xảy ra khi tạo cộng đồng.",
        duration: 3000,
      });
    }
  });
};

export const useCreateCommunity = () => {
  const qc = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },

    onError: (error) => {
      showToast({
        type: "error",
        message: (error as Error).message || "Đã có lỗi xảy ra khi tạo cộng đồng.",
        duration: 3000,
      });
    }
    
  });
};
