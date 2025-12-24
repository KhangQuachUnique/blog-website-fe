import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

const PostCommentsSectionSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 920, mx: "auto", p: { xs: 2, md: 6 } }}>
      {/* Header: title + sort */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Skeleton variant="text" width={140} height={28} animation="wave" />
        <Skeleton variant="rounded" width={140} height={40} animation="wave" />
      </Stack>

      {/* Comment input area */}
      <Box sx={{ mb: 2 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={112}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={88} height={40} animation="wave" />
        </Stack>
      </Box>

      {/* Comments list */}
      <Stack spacing={3}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Box key={idx}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Skeleton
                variant="circular"
                width={44}
                height={44}
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
                    width={160}
                    height={20}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width={96}
                    height={16}
                    animation="wave"
                  />
                </Stack>

                <Stack spacing={0.75} sx={{ mb: 1 }}>
                  <Skeleton
                    variant="text"
                    width={`${100 - idx * 10}%`}
                    height={16}
                    animation="wave"
                  />
                  <Skeleton
                    variant="text"
                    width={`${78 - idx * 8}%`}
                    height={16}
                    animation="wave"
                  />
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton
                    variant="text"
                    width={56}
                    height={20}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rounded"
                    width={20}
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

export default PostCommentsSectionSkeleton;
