import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export const ReportTableSkeleton = () => {
  const rows = Array.from(new Array(5));

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "16px",
        border: "2px solid #e5e7eb",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        {/* Skeleton Header */}
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9fafb" }}>
            {/* ID, Type, Reason, Reporter, Status, Date, Action */}
            {[50, 100, 200, 150, 120, 100, 100].map((width, index) => (
              <TableCell key={index}>
                <Skeleton variant="text" width={width} height={24} sx={{ bgcolor: "grey.300" }} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Skeleton Body */}
        <TableBody>
          {rows.map((_, index) => (
            <TableRow key={index}>
              {/* ID */}
              <TableCell>
                <Skeleton width={40} />
              </TableCell>

              {/* Type (Badge shape) */}
              <TableCell>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 99 }} />
              </TableCell>

              {/* Reason (Longer text) */}
              <TableCell>
                <Skeleton width="90%" />
                <Skeleton width="60%" height={15} />
              </TableCell>

              {/* Reporter (Avatar + Name) */}
              <TableCell>
                 <Box display="flex" alignItems="center" gap={1}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton width={80} />
                 </Box>
              </TableCell>

              {/* Status (Badge) */}
              <TableCell align="center">
                <Box display="flex" justifyContent="center">
                   <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 6 }} />
                </Box>
              </TableCell>

              {/* Date */}
              <TableCell align="center">
                <Skeleton width={100} />
              </TableCell>

              {/* Actions (Buttons) */}
              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={1}>
                  <Skeleton variant="rounded" width={32} height={32} />
                  <Skeleton variant="rounded" width={32} height={32} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};