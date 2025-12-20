import { useInfiniteQuery } from "@tanstack/react-query";
import { getNewsfeed } from "../services/user/newsFeed/newsfeedService";

const NEWSFEED_SEED_KEY = "newsfeed_session_seed";
let __newsfeed_seed_reload_handled = false;

export const getOrCreateSessionSeed = (): number => {
  // Run reload-detection only once per page load to avoid clearing the seed repeatedly
  if (!__newsfeed_seed_reload_handled) {
    try {
      const navEntries = (performance &&
        (performance.getEntriesByType?.("navigation") || [])) as any[];
      const navType =
        navEntries[0]?.type ?? (performance as any).navigation?.type;
      // In older browsers performance.navigation.type === 1 indicates reload
      const isReload = navType === "reload" || navType === 1;
      if (isReload) {
        sessionStorage.removeItem(NEWSFEED_SEED_KEY);
      }
    } catch (e) {
      // ignore
    }
    __newsfeed_seed_reload_handled = true;
  }

  const stored = sessionStorage.getItem(NEWSFEED_SEED_KEY);
  if (stored) return parseFloat(stored);
  const newSeed = Math.random();
  sessionStorage.setItem(NEWSFEED_SEED_KEY, newSeed.toString());
  return newSeed;
};

export const useGetNewsFeed = () => {
  // compute seed once per hook invocation (reads from sessionStorage, not React state)
  const sessionSeed = getOrCreateSessionSeed();

  return useInfiniteQuery({
    queryKey: ["newsfeed", sessionSeed],
    queryFn: ({ pageParam }) =>
      getNewsfeed(pageParam ?? undefined, sessionSeed),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // Try several common locations for the next-cursor
      const limit = 15;
      const nextCursor =
        lastPage?.pagination?.nextCursor ??
        lastPage?.nextCursor ??
        lastPage?.data?.pagination?.nextCursor ??
        lastPage?.pagination?.cursor ??
        undefined;

      // If items array exists and is shorter than page limit, assume no next page
      const items =
        lastPage?.items ?? lastPage?.data?.items ?? lastPage?.results ?? null;
      if (Array.isArray(items) && items.length < limit) return undefined;

      return nextCursor ?? undefined;
    },
  });
};
