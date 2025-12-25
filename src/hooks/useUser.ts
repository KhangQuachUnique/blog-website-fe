import { useQuery } from "@tanstack/react-query";
import { getMyProfile, getUserProfile } from "../services/user/userService";
import type { UserProfile } from "../types/user.ts";
import { useAuthUser } from "./useAuth.ts";

export const useGetUserProfile = (userId?: number) => {
  const { user } = useAuthUser();
  const isMe = !userId || (userId && user?.id === userId);
  console.log("Fetching profile for userId:", userId, "isMe:", isMe);

  return useQuery<UserProfile>({
    queryKey: !isMe ? ["userProfile", userId] : ["userProfile", "me"],
    queryFn: () => {
      if (!isMe && userId) {
        return getUserProfile(userId, user?.id);
      }
      return getMyProfile();
    },
    enabled: userId ? Number.isFinite(userId) && userId > 0 : true,
    staleTime: 1000 * 60, // 1 minute
  });
};

export default useGetUserProfile;
