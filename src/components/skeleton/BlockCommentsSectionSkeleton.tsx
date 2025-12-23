import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

const BlockCommentsSectionSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Skeleton variant="text" width={140} height={28} animation="wave" />
      </Stack>

      {/* Comment input */}
      <Box sx={{ mb: 3 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={96}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={84} height={36} animation="wave" />
        </Stack>
      </Box>

      {/* Comments list */}
      <Stack spacing={3}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Box key={idx}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                animation="wave"
              />

              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Skeleton
                    variant="text"
                    width={140}
                    height={20}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width={56}
                    height={16}
                    animation="wave"
                  />
                </Stack>

                <Stack spacing={0.75} sx={{ mb: 1 }}>
                  <Skeleton
                    variant="text"
                    width={`${100 - idx * 8}%`}
                    height={16}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width={`${82 - idx * 6}%`}
                    height={16}
                    animation="wave"
                  />
                </Stack>

                {/* reply preview (nested) */}
                <Box
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    p: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton
                      variant="circular"
                      width={28}
                      height={28}
                      animation="wave"
                    />
                    <Skeleton
                      variant="text"
                      width={120}
                      height={16}
                      animation="wave"
                    />
                    <Box sx={{ flex: 1 }} />
                    <Skeleton
                      variant="rounded"
                      width={56}
                      height={28}
                      animation="wave"
                    />
                  </Stack>
                </Box>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Skeleton
                    variant="text"
                    width={56}
                    height={20}
                    animation="wave"
                  />
                </Stack>
              </Box>
            </Stack>

            {idx < 3 && (
              <Box
                sx={{
                  mt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: 2,
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default BlockCommentsSectionSkeleton;
