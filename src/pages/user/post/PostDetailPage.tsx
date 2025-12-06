import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import ImageBlock from '../../../components/block/imageBlock';
import TextBlock from '../../../components/block/textBlock';
import { InteractBar } from '../../../components/InteractBar';
import { CommentsSection, BlockCommentsSidebar } from '../../../components/comments';
import { useAuth } from '../../../contexts/AuthContext';
import { useComments } from '../../../hooks/useComments';
import type { IPostResponseDto, IBlockResponseDto } from '../../../types/post';
import axios from '../../../config/axiosCustomize';

// Fetch post detail
const getPostDetail = async (postId: string): Promise<IPostResponseDto> => {
  const response = await axios.get(`/blog-posts/${postId}`);
  return response as unknown as IPostResponseDto;
};

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const postId = id ? parseInt(id) : undefined;
  
  // Sidebar state for block comments
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<{ blockId: number; imageUrl: string } | null>(null);
  
  // Fetch comments để lấy totalCount cho InteractBar
  const { totalCount: commentsCount } = useComments(postId);

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPostDetail(id!),
    enabled: !!id,
  });

  const currentUser = user ? {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
  } : undefined;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 text-xl mb-4">Không tìm thấy bài viết</p>
        <p className="text-gray-500">
          {error instanceof Error ? error.message : 'Đã có lỗi xảy ra'}
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle image block click to open sidebar
  const handleImageClick = (blockId: number, imageUrl: string) => {
    setSelectedBlock({ blockId, imageUrl });
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedBlock(null);
  };

  // Render block based on type
  const renderBlock = (block: IBlockResponseDto) => {
    switch (block.type) {
      case 'IMAGE':
        return (
          <ImageBlock
            key={block.id}
            id={`block-${block.id}`}
            blockId={block.id}
            imageUrl={block.content}
            onClick={handleImageClick}
          />
        );
      case 'TEXT':
        return (
          <TextBlock
            key={block.id}
            id={`block-${block.id}`}
            content={block.content}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Post Header */}
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Thumbnail */}
        {post.thumbnailUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Author & Meta */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <img
              src={post.author.avatarUrl || '/default-avatar.png'}
              alt={post.author.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-pink-300"
            />
            <div>
              <p className="font-semibold text-gray-900">{post.author.username}</p>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
            {post.community && (
              <span className="ml-auto px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm">
                {typeof post.community === 'string' ? post.community : post.community.name}
              </span>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.hashtags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Short Description */}
          {post.shortDescription && (
            <p className="text-gray-600 text-lg mb-6 italic">
              {post.shortDescription}
            </p>
          )}

          {/* Content Blocks */}
          {post.blocks && post.blocks.length > 0 && (
            <div className="space-y-6 mb-8">
              {post.blocks
                .sort((a, b) => a.y - b.y || a.x - b.x)
                .map(renderBlock)}
            </div>
          )}

          {/* Interact Bar */}
          <div className="border-t border-gray-200 pt-4">
            <InteractBar
              postId={Number(post.id)}
              userId={user?.id ?? 0}
              initialUpVotes={post.upVotes}
              initialDownVotes={post.downVotes}
              totalComments={commentsCount}
            />
          </div>
        </div>
      </article>

      {/* Post Comments Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <CommentsSection
          postId={Number(post.id)}
          currentUser={currentUser}
        />
      </div>

      {/* Block Comments Sidebar */}
      <BlockCommentsSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        blockId={selectedBlock?.blockId ?? 0}
        imageUrl={selectedBlock?.imageUrl}
        currentUser={currentUser}
      />
    </div>
  );
};

export default PostDetailPage;
