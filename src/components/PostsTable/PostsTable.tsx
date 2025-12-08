import React from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from '@mui/material';
import type { BlogPost, EBlogPostStatus } from '../../types/post';

interface PostsTableProps {
  posts: BlogPost[];
  onHide: (postId: number) => void;
  onRestore: (postId: number) => void;
  loadingId: number | null;
  emptyMessage?: string;
}

// ✅ Màu trạng thái
  const getStatusColor = (status: EBlogPostStatus) => {
  switch (status) {
    case 'ACTIVE':
      return { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669', badge: '#d1fae5' };
    case 'HIDDEN':
      return { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', badge: '#e2e8f0' };
    case 'DRAFT':
      return { bg: '#fffbeb', border: '#fde68a', text: '#b45309', badge: '#fef3c7' };
    default:
      return { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', badge: '#e2e8f0' };
  }
};

  const getStatusIcon = (status: EBlogPostStatus) => {
  switch (status) {
    case 'ACTIVE':
      return '✓';
    case 'HIDDEN':
      return '👁️';
    case 'DRAFT':
      return '✎';
    default:
      return '';
  }
};

const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  onHide,
  onRestore,
  loadingId,
  emptyMessage = 'Không có bài viết nào',
}) => {
  // ✅ Nếu không có bài viết
  if (posts.length === 0) {
    return (
      <Paper
        sx={{
          textAlign: 'center',
          py: 8,
          borderRadius: '16px',
          border: '2px solid #fce7f3',
          backgroundColor: '#ffffff',
        }}
      >
        <Box sx={{ fontSize: '48px', mb: 2 }}>📭</Box>
        <Box sx={{ color: '#4b5563', fontWeight: '600' }}>{emptyMessage}</Box>
      </Paper>
    );
  }

  // ✅ Render bảng
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: '16px',
        border: '2px solid #fce7f3',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
        {/* Header */}
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: '#fce7f3',
              '& th': {
                color: '#8c1d35',
                fontWeight: 'bold',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              },
            }}
          >
            <TableCell align="left">ID</TableCell>
            <TableCell align="left">Tiêu đề</TableCell>
            <TableCell align="left">Ngày tạo</TableCell>
            <TableCell align="center">Trạng thái</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody
          sx={{
            '& tr:hover': {
              backgroundColor: '#faf5f7',
              transition: 'background-color 0.2s ease-in-out',
            },
            '& tr:nth-of-type(odd)': {
              backgroundColor: '#ffffff',
            },
            '& tr:nth-of-type(even)': {
              backgroundColor: '#fffbfc',
            },
          }}
        >
          {posts.map((post) => {
            const colors = getStatusColor(post.status);
            const isActionLoading = loadingId === post.id;

            return (
              <TableRow key={post.id}>
                {/* ID */}
                <TableCell
                  align="left"
                  sx={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    px: 3,
                    py: 2,
                    verticalAlign: 'middle', // Căn giữa theo chiều dọc
                  }}
                >
                  #{post.id}
                </TableCell>

                {/* Title - Đã sửa lỗi lệch dòng kẻ */}
                <TableCell
                  align="left"
                  sx={{
                    px: 3,
                    py: 2,
                    verticalAlign: 'middle', // Căn giữa theo chiều dọc
                    maxWidth: '300px', // Đặt giới hạn chiều rộng cho cột
                  }}
                >
                  {/* Bọc text trong Box để xử lý truncate mà không ảnh hưởng đến display: table-cell của td */}
                  <Box
                    sx={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                    }}
                  >
                    {post.title}
                  </Box>
                </TableCell>

                {/* Created Date */}
                <TableCell
                  align="left"
                  sx={{
                    fontSize: '14px',
                    color: '#4b5563',
                    px: 3,
                    py: 2,
                    verticalAlign: 'middle',
                  }}
                >
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>

                {/* Status */}
                <TableCell
                  align="center"
                  sx={{
                    px: 3,
                    py: 2,
                    verticalAlign: 'middle',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      px: 3,
                      py: 1,
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      backgroundColor: colors.badge,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <span>{getStatusIcon(post.status)}</span>
                    {post.status}
                  </Box>
                </TableCell>

                {/* Actions */}
                <TableCell
                  align="center"
                  sx={{
                    px: 3,
                    py: 2,
                    verticalAlign: 'middle',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    {post.status === 'ACTIVE' ? (
                      <Button
                        type="button"
                        onClick={() => onHide(post.id)}
                        disabled={isActionLoading}
                        variant="outlined"
                        size="small"
                        sx={{
                          p: '10px',
                          minWidth: 'auto',
                          color: '#b45309',
                          backgroundColor: '#fffbeb',
                          borderColor: '#fde68a',
                          borderWidth: '2px',
                          '&:hover': {
                            backgroundColor: '#fef3c7',
                            borderColor: '#fcd34d',
                          },
                          '&:disabled': {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                          },
                        }}
                        title="Ẩn bài viết"
                      >
                        {isActionLoading ? (
                          <AiOutlineLoading3Quarters
                            className="animate-spin"
                            size={18}
                          />
                        ) : (
                          <AiOutlineEyeInvisible size={18} />
                        )}
                      </Button>
                    ) : post.status === 'HIDDEN' ? (
                      <Button
                        type="button"
                        onClick={() => onRestore(post.id)}
                        disabled={isActionLoading}
                        variant="outlined"
                        size="small"
                        sx={{
                          p: '10px',
                          minWidth: 'auto',
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          borderColor: '#a7f3d0',
                          borderWidth: '2px',
                          '&:hover': {
                            backgroundColor: '#d1fae5',
                            borderColor: '#6ee7b7',
                          },
                          '&:disabled': {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                          },
                        }}
                        title="Phục hồi bài viết"
                      >
                        {isActionLoading ? (
                          <AiOutlineLoading3Quarters
                            className="animate-spin"
                            size={18}
                          />
                        ) : (
                          <AiOutlineEye size={18} />
                        )}
                      </Button>
                    ) : (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          color: '#d1d5db',
                          fontSize: '12px',
                        }}
                      >
                        Không thể hành động
                      </Box>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PostsTable;