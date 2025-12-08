import React from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Box } from '@mui/material';
import GenericTable from './GenericTable';
import type { TableColumn, TableAction } from '../../types/table';
import { BLOOGIE_COLORS as colors } from '../../types/table';
import type { BlogPost, EBlogPostStatus } from '../../types/post';

interface PostsTableProps {
  posts: BlogPost[];
  onHide: (postId: number) => void;
  onRestore: (postId: number) => void;
  loadingId: number | null;
  emptyMessage?: string;
}

/**
 * PostsTable - A wrapper around GenericTable customized for blog posts
 * Provides backward compatibility while leveraging GenericTable's flexibility
 */
const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  onHide,
  onRestore,
  loadingId,
  emptyMessage = 'Không có bài viết nào',
}) => {
  const getStatusColor = (status: EBlogPostStatus) => {
    switch (status) {
      case 'ACTIVE':
        return colors.statusActive;
      case 'HIDDEN':
        return colors.statusHidden;
      case 'DRAFT':
        return colors.statusDraft;
      default:
        return colors.statusHidden;
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

  const columns: TableColumn<BlogPost>[] = [
    {
      id: 'id',
      label: 'ID',
      width: '80px',
      align: 'left',
      render: (post) => (
        <Box sx={{ fontWeight: '600', color: colors.text }}>#{post.id}</Box>
      ),
    },
    {
      id: 'title',
      label: 'Tiêu đề',
      align: 'left',
      render: (post) => (
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text,
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
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      align: 'left',
      render: (post) => (
        <Box sx={{ fontSize: '14px', color: colors.textSecondary }}>
          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      align: 'center',
      render: (post) => {
        const statusColors = getStatusColor(post.status);
        const icon = getStatusIcon(post.status);
        return (
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
              backgroundColor: statusColors.badge,
              color: statusColors.text,
              border: `1px solid ${statusColors.border}`,
            }}
          >
            <span>{icon}</span>
            {post.status}
          </Box>
        );
      },
    },
  ];

  const actions: TableAction<BlogPost>[] = [
    {
      id: 'hide-restore',
      visible: (post) => post.status === 'ACTIVE' || post.status === 'HIDDEN',
      disabled: (post) => loadingId === post.id,
      icon: (post) => {
        const isLoading = loadingId === post.id;
        if (post.status === 'ACTIVE') {
          return (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                color: '#b45309',
                backgroundColor: '#fffbeb',
                border: '2px solid #fde68a',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: '#fef3c7',
                  borderColor: '#fcd34d',
                },
              }}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="animate-spin" size={18} />
              ) : (
                <AiOutlineEyeInvisible size={18} />
              )}
            </Box>
          );
        } else {
          return (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '2px solid #a7f3d0',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: '#d1fae5',
                  borderColor: '#6ee7b7',
                },
              }}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="animate-spin" size={18} />
              ) : (
                <AiOutlineEye size={18} />
              )}
            </Box>
          );
        }
      },
      onClick: (post) => {
        if (post.status === 'ACTIVE') {
          onHide(post.id);
        } else if (post.status === 'HIDDEN') {
          onRestore(post.id);
        }
      },
    },
  ];

  return (
    <GenericTable
      data={posts}
      columns={columns}
      actions={actions}
      emptyMessage={emptyMessage}
    />
  );
};

export default PostsTable;
