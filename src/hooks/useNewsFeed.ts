import { useInfiniteQuery } from "@tanstack/react-query";
import { getNewsfeed } from "../services/user/newsFeed/newsfeedService";
import type { IGetNewsfeedResponseDto } from "../types/newsfeed";

const NEWSFEED_SEED_KEY = "newsfeed_session_seed";
let __newsfeed_seed_reload_handled = false;

export const getOrCreateSessionSeed = (): number => {
  // Run reload-detection only once per page load to avoid clearing the seed repeatedly
  if (!__newsfeed_seed_reload_handled) {
    try {
      const navEntries = (performance &&
        (performance.getEntriesByType?.("navigation") ||
          [])) as PerformanceEntryList;
      const perfNav = (
        performance as unknown as { navigation?: { type: number } }
      ).navigation;
      const navType =
        (navEntries[0] as PerformanceNavigationTiming | undefined)?.type ??
        perfNav?.type;
      // In older browsers performance.navigation.type === 1 indicates reload
      const isReload = navType === "reload" || navType === 1;
      if (isReload) {
        sessionStorage.removeItem(NEWSFEED_SEED_KEY);
      }
    } catch {
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

  return useInfiniteQuery<IGetNewsfeedResponseDto>({
    queryKey: ["newsfeed", sessionSeed],
    queryFn: ({ pageParam }) =>
      getNewsfeed((pageParam as string | undefined) ?? undefined, sessionSeed),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      // Try several common locations for the next-cursor
      const limit = 15;
      const nextCursor = lastPage?.pagination?.nextCursor ?? undefined;

      // If items array exists and is shorter than page limit, assume no next page
      const items = lastPage?.items ?? null;
      if (Array.isArray(items) && items.length < limit) return undefined;

      return nextCursor ?? undefined;
    },
  });
};
