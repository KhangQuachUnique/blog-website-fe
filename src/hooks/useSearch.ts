import { useInfiniteQuery } from "@tanstack/react-query";
import { searchWithPagination } from "../services/search/search.service";
import type { ISearchResponseDto } from "../services/search/search.service";

interface UseSearchParams {
  keyword: string;
  type: string;
  enabled?: boolean;
}

export const useSearch = ({
  keyword,
  type,
  enabled = true,
}: UseSearchParams) => {
  return useInfiniteQuery<ISearchResponseDto>({
    queryKey: ["search", keyword, type],
    queryFn: ({ pageParam }) =>
      searchWithPagination(
        keyword,
        type,
        (pageParam as string | undefined) ?? undefined
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const limit = 15;
      const nextCursor = lastPage?.pagination?.nextCursor ?? undefined;

      // Nếu không có items hoặc items ít hơn limit, không còn trang tiếp
      const items = lastPage?.items ?? [];
      if (items.length < limit) return undefined;

      return nextCursor;
    },
    enabled: enabled && !!keyword,
  });
};
