import { useInfiniteQuery } from "@tanstack/react-query";
import { getNewsfeed } from "../services/user/newsFeed/newsfeedService";

export const useGetNewsFeed = () => {
  return useInfiniteQuery({
    queryKey: ["newsfeed"],
    queryFn: ({ pageParam }) => getNewsfeed(pageParam ?? undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.nextCursor ?? undefined,
  });
};
