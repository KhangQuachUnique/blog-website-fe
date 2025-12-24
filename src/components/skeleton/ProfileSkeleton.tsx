import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

const ProfileSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Cover */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={300}
        animation="wave"
      />

      {/* Content container (avatar overlaps cover) */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "900px", position: "relative" }}>
          <Box sx={{ position: "absolute", top: -56 }}>
            <Skeleton
              variant="circular"
              width={112}
              height={112}
              animation="wave"
            />
          </Box>

          {/* Spacer to account for avatar overlap */}
          <Box sx={{ height: 64 }} />

          {/* Name, join date and action */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Stack spacing={0.5}>
              <Skeleton
                variant="text"
                width={260}
                height={36}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={160}
                height={20}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={420}
                height={18}
                animation="wave"
                sx={{ mt: 1 }}
              />
            </Stack>

            <Skeleton
              variant="rounded"
              width={96}
              height={40}
              animation="wave"
            />
          </Stack>

          {/* Bio / description */}
          <Stack spacing={1} sx={{ maxWidth: 760, mb: 3 }}>
            <Skeleton
              variant="text"
              width="100%"
              height={18}
              animation="wave"
            />
            <Skeleton variant="text" width="92%" height={18} animation="wave" />
            <Skeleton variant="text" width="76%" height={18} animation="wave" />
          </Stack>

          {/* Stats row */}
          <Stack
            direction="row"
            spacing={6}
            alignItems="center"
            sx={{ py: 3, borderTop: "1px solid", borderColor: "divider" }}
          >
            <Stack spacing={0.5}>
              <Skeleton
                variant="text"
                width={28}
                height={28}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={84}
                height={16}
                animation="wave"
              />
            </Stack>
            <Stack spacing={0.5}>
              <Skeleton
                variant="text"
                width={28}
                height={28}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={84}
                height={16}
                animation="wave"
              />
            </Stack>
            <Stack spacing={0.5}>
              <Skeleton
                variant="text"
                width={28}
                height={28}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width={84}
                height={16}
                animation="wave"
              />
            </Stack>
          </Stack>

          {/* Tabs / Nav */}
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", mt: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mt: 2, pb: 2 }}>
              <Skeleton
                variant="rounded"
                width={200}
                height={48}
                animation="wave"
              />
              <Skeleton
                variant="rounded"
                width={160}
                height={48}
                animation="wave"
              />
              <Skeleton
                variant="rounded"
                width={140}
                height={48}
                animation="wave"
              />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSkeleton;
