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

export const PostTableSkeleton = () => {
  const rows = Array.from(new Array(5));

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "16px",
        border: "2px solid #e5e7eb", // Màu xám nhạt (gray-200) giả lập border bảng
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        {/* Skeleton Header */}
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9fafb" }}>
             {/* Mô phỏng các cột: ID, Tiêu đề, Ngày, Trạng thái, Report, Action */}
            {[50, 200, 100, 100, 80, 100].map((width, index) => (
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
              {/* Cột ID */}
              <TableCell>
                <Skeleton width={40} />
              </TableCell>
              
              {/* Cột Tiêu đề */}
              <TableCell>
                <Skeleton width="90%" />
                <Skeleton width="40%" height={15} />
              </TableCell>

              {/* Cột Ngày đăng */}
              <TableCell>
                <Skeleton width={100} />
              </TableCell>

              {/* Cột Trạng thái (Badge) */}
              <TableCell align="center">
                <Box display="flex" justifyContent="center">
                  <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 99 }} />
                </Box>
              </TableCell>

              {/* Cột Report (Icon) */}
              <TableCell align="center">
                <Box display="flex" justifyContent="center">
                   <Skeleton variant="rounded" width={32} height={32} />
                </Box>
              </TableCell>
              
               {/* Cột Action (Ẩn/Hiện) */}
               <TableCell align="center">
                <Box display="flex" justifyContent="center">
                   <Skeleton variant="rounded" width={36} height={36} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};