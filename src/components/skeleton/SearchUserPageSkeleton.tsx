import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

const SearchUserPageSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack spacing={4}>
          <Stack
            direction="row"
            spacing={3}
            sx={{ flexWrap: "wrap", gap: 24, justifyContent: "space-between" }}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <Box
                key={idx}
                sx={{ width: { xs: "100%", sm: "48%", md: "31%" } }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "background.paper",
                    boxShadow: 1,
                  }}
                >
                  {/* Cover */}
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={160}
                    animation="wave"
                  />

                  {/* Avatar overlaps cover */}
                  <Box sx={{ px: 2, pb: 2, pt: 1, position: "relative" }}>
                    <Box sx={{ position: "absolute", top: -36, left: 16 }}>
                      <Skeleton
                        variant="circular"
                        width={72}
                        height={72}
                        animation="wave"
                      />
                    </Box>

                    {/* spacer for avatar */}
                    <Box sx={{ height: 36 }} />

                    {/* Name + gender */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ pl: 12 }}
                    >
                      <Skeleton
                        variant="text"
                        width={140}
                        height={28}
                        animation="wave"
                      />
                      <Skeleton
                        variant="circular"
                        width={20}
                        height={20}
                        animation="wave"
                      />
                    </Stack>

                    {/* Bio lines */}
                    <Stack spacing={1} sx={{ mt: 2, pl: 12 }}>
                      <Skeleton
                        variant="text"
                        width="100%"
                        height={16}
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={16}
                        animation="wave"
                      />
                    </Stack>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SearchUserPageSkeleton;
