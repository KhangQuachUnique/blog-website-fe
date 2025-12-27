import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getManageCommunityMembers,
  removeCommunityMember,
  updateCommunityMemberRole,
  leaveCommunity,
  deleteCommunity,
  joinCommunity, // ✅ thêm
} from "../services/user/community/communityService";
import type { ECommunityRole, EManageCommunityRole } from "../types/community";

export function useManageCommunityMembers(
  communityId?: number,
  role?: EManageCommunityRole
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
    mutationFn: (p: { memberId: number; role: ECommunityRole }) =>
      updateCommunityMemberRole(communityId, p.memberId, p.role),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["manage-community-members", communityId],
      });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
}

export function useRemoveMember(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (p: { memberId: number; ban?: boolean }) =>
      removeCommunityMember(communityId, p.memberId, { ban: p.ban }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["manage-community-members", communityId],
      });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
}

/**
 * ✅ JOIN community
 * - public + no approval => vào MEMBER ngay
 * - private hoặc require approval => PENDING
 */
export function useJoinCommunity(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => joinCommunity(communityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({
        queryKey: ["manage-community-members", communityId],
      });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
}

// ✅ Leave community
export function useLeaveCommunity(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => leaveCommunity(communityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({
        queryKey: ["manage-community-members", communityId],
      });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
}

// ✅ Delete community
export function useDeleteCommunity(communityId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCommunity(communityId),
    onSuccess: () => {
      // invalidate danh sách & các query liên quan
      qc.invalidateQueries({ queryKey: ["communitySettings", communityId] });
      qc.invalidateQueries({ queryKey: ["community-members", communityId] });
      qc.invalidateQueries({
        queryKey: ["manage-community-members", communityId],
      });
      qc.invalidateQueries({ queryKey: ["myCommunities"] });
    },
  });
}
