// src/hooks/useCommunityMembers.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCommunityMembers } from "../services/user/community/communityService";
import type {} from "../services/user/community/communityService";
import type {
  ECommunityRole,
  EManageCommunityRole,
  IMemberResponse,
} from "../types/community";

type GroupedMembers = Record<ECommunityRole, IMemberResponse[]>;
type CommunityRole = Exclude<EManageCommunityRole, "PENDING">;

const ROLE_KEYS: CommunityRole[] = ["ADMIN", "MODERATOR", "MEMBER"];

function isPublicRole(role: IMemberResponse["role"]): role is CommunityRole {
  return ROLE_KEYS.includes(role as CommunityRole);
}

function groupByRole(members: IMemberResponse[]): GroupedMembers {
  return members.reduce<GroupedMembers>(
    (acc, m) => {
      if (isPublicRole(m.role)) {
        acc[m.role].push(m);
      }
      return acc;
    },
    { ADMIN: [], MODERATOR: [], MEMBER: [] }
  );
}

export function useCommunityMembers(communityId: number) {
  const query = useQuery({
    queryKey: ["community-members", communityId],
    queryFn: () => getCommunityMembers(communityId),
    enabled: !!communityId && communityId > 0,
    staleTime: 30_000,
  });

  const members = query.data;

  const grouped = useMemo(() => groupByRole(members ?? []), [members]);

  const total = (members ?? []).filter((m) => isPublicRole(m.role)).length;

  if (!members) {
    return {
      ...query,
      members: [],
      total: 0,
      grouped: { ADMIN: [], MODERATOR: [], MEMBER: [] },
    };
  }

  return { ...query, members, total, grouped };
}
