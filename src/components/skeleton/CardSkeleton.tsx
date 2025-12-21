import { Box, Skeleton, Stack } from "@mui/material";

export const CardSkeleton = () => {
  return (
    <Box
      display="flex"
      borderRadius={3}
      overflow="hidden"
      border="1px solid"
      borderColor="divider"
      bgcolor="background.paper"
    >
      {/* LEFT: Image */}
      <Skeleton
        variant="rectangular"
        width={360}
        height={300}
        animation="wave"
        sx={{
          flexShrink: 0,
        }}
      />

      {/* RIGHT: Content */}
      <Stack spacing={1.5} p={2} flex={1}>
        {/* Title */}
        <Skeleton variant="text" width="70%" height={32} animation="wave" />

        {/* Author row */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={140} />
          <Skeleton variant="text" width={80} />
        </Stack>

        {/* Tags */}
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="rounded" width={90} height={24} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Stack>

        {/* Spacer */}
        <Box flex={1} />

        {/* Media preview */}
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={48} height={32} />
          <Skeleton variant="rounded" width={48} height={32} />
          <Skeleton variant="rounded" width={48} height={32} />
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} mt={1}>
          <Skeleton variant="rounded" width={72} height={36} />
          <Skeleton variant="rounded" width={72} height={36} />
          <Skeleton variant="rounded" width={36} height={36} />
        </Stack>
      </Stack>
    </Box>
  );
};
