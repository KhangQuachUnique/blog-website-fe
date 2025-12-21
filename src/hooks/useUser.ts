import { useQuery } from "@tanstack/react-query";
import { getMyProfile, getUserProfile } from "../services/user/userService";
import type { UserProfile } from "../types/user.ts";

export const useGetUserProfile = (
  userId?: number,
  viewerId?: number | null
) => {
  return useQuery<UserProfile>({
    queryKey: ["userProfile", userId ?? "me", viewerId ?? "self"],
    queryFn: () => {
      if (userId && Number.isFinite(userId) && userId > 0) {
        return getUserProfile(userId, viewerId ?? undefined);
      }
      return getMyProfile();
    },
    enabled: userId ? Number.isFinite(userId) && userId > 0 : true,
    staleTime: 1000 * 60, // 1 minute
  });
};

export default useGetUserProfile;
