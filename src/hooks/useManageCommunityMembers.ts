import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getManageCommunityMembers,
  removeCommunityMember,
  updateCommunityMemberRole,
  leaveCommunity,
  deleteCommunity,
} from "../services/user/community/communityService";

import type {
  CommunityRole,
  ManageCommunityRole,
} from "../services/user/community/communityService";

export function useManageCommunityMembers(
  communityId?: number,
  role?: ManageCommunityRole
) {
  return useQuery({
    queryKey: ["manage-community-members", communityId, role ?? "ALL"],
    queryFn: () => getManageCommunityMembers(communityId as number, role),
    enabled: !!communityId && communityId > 0,
    staleTime: 15_000,
  });
}

export function useUpdateMemberRole(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (p: { memberId: number; role: CommunityRole }) =>
      updateCommunityMemberRole(communityId, p.memberId, p.role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manage-community-members", communityId] });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
    },
  });
}

export function useRemoveMember(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => removeCommunityMember(communityId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["manage-community-members", communityId] });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
    },
  });
}

// ✅ Leave community
export function useLeaveCommunity(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => leaveCommunity(communityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communitySettings"] });
      qc.invalidateQueries({ queryKey: ["community-members"] });
      qc.invalidateQueries({ queryKey: ["manage-community-members"] });

      // tùy project bạn có query list cộng đồng nào thì invalidate thêm
      qc.invalidateQueries({ queryKey: ["my-communities"] });
      qc.invalidateQueries({ queryKey: ["communities", "my"] });
    },
  });
}

// ✅ Delete community
export function useDeleteCommunity(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCommunity(communityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communitySettings"] });
      qc.invalidateQueries({ queryKey: ["community-members"] });
      qc.invalidateQueries({ queryKey: ["manage-community-members"] });

      qc.invalidateQueries({ queryKey: ["my-communities"] });
      qc.invalidateQueries({ queryKey: ["communities", "my"] });
    },
  });
}
