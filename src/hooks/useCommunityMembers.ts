// src/hooks/useCommunityMembers.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCommunityMembers } from "../services/user/community/communityService";
import type {
  CommunityMember,
  CommunityRole,
} from "../services/user/community/communityService";

type GroupedMembers = Record<CommunityRole, CommunityMember[]>;

function groupByRole(members: CommunityMember[]): GroupedMembers {
  return members.reduce<GroupedMembers>(
    (acc, m) => {
      acc[m.role].push(m);
      return acc;
    },
    { ADMIN: [], MODERATOR: [], MEMBER: [] } // ✅ luôn tạo object mới
  );
}

export function useCommunityMembers(communityId?: number) {
  const query = useQuery<CommunityMember[]>({
    queryKey: ["community-members", communityId],
    queryFn: () => getCommunityMembers(communityId as number),
    enabled: !!communityId && communityId > 0,
    staleTime: 30_000,
  });

  const members = query.data ?? [];
  const total = members.length;

  const grouped = useMemo(() => groupByRole(members), [members]);

  return { ...query, members, total, grouped };
}
