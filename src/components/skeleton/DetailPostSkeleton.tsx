import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

const DetailPostSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 920, mx: "auto", p: { xs: 2, md: 6 } }}>
      {/* Title */}
      <Skeleton variant="text" width="55%" height={64} animation="wave" />

      {/* Subtitle / excerpt */}
      <Skeleton
        variant="text"
        width="30%"
        height={20}
        animation="wave"
        sx={{ mt: 1, mb: 3 }}
      />

      {/* Author row: avatar + name + date */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Skeleton variant="circular" width={56} height={56} />
        <Stack spacing={0.5}>
          <Skeleton variant="text" width={160} height={20} />
          <Skeleton variant="text" width={96} height={16} />
        </Stack>
      </Stack>

      {/* Hashtag pill */}
      <Skeleton
        variant="rounded"
        width={90}
        height={28}
        animation="wave"
        sx={{ mb: 3 }}
      />

      {/* Reactions row (emoji pills) */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexWrap: "wrap", mb: 4 }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={48}
            height={36}
            animation="wave"
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Stack>

      {/* Optional large image */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={360}
        animation="wave"
        sx={{ mb: 4 }}
      />

      {/* Article content: several paragraph lines with varying widths */}
      <Stack spacing={1.25} sx={{ mb: 4 }}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="text"
            width={`${100 - idx * 8}%`}
            height={18}
            animation="wave"
          />
        ))}
      </Stack>

      {/* Actions row: reactions / comment / share */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Skeleton variant="rounded" width={96} height={40} animation="wave" />
        <Skeleton variant="rounded" width={96} height={40} animation="wave" />
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
      </Stack>
    </Box>
  );
};

export default DetailPostSkeleton;
