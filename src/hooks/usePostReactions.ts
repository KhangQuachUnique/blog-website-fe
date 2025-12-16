import { useState, useEffect, useCallback } from 'react';
import {
  togglePostReact,
  getPostReactions,
  type EmojiSummary,
  type ToggleReactDto,
} from '../services/user/reactions/reactionService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/toast';

interface UsePostReactionsOptions {
  postId: number;
  enabled?: boolean;
}

export const usePostReactions = ({ postId, enabled = true }: UsePostReactionsOptions) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reactions, setReactions] = useState<EmojiSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    if (!enabled || hasLoaded) return;

    setIsLoading(true);
    try {
      const data = await getPostReactions(postId, user?.id);
      setReactions(data.emojis);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, user?.id, enabled, hasLoaded]);

  // Initial load when enabled
  useEffect(() => {
    if (enabled && !hasLoaded) {
      fetchReactions();
    }
  }, [enabled, hasLoaded, fetchReactions]);

  /**
   * Toggle react với emojiId
   * - Click 1 lần = react
   * - Click lần 2 = unreact
   */
  const handleReactionClick = async (emojiId: number) => {
    if (!user) {
      showToast({
        type: 'info',
        message: 'Vui lòng đăng nhập để react',
        duration: 3000,
      });
      return;
    }

    setIsReacting(true);
    try {
      const dto: ToggleReactDto = {
        userId: user.id,
        emojiId,
        postId,
      };

      await togglePostReact(dto);

      // Refetch reactions sau khi toggle
      const updatedData = await getPostReactions(postId, user.id);
      setReactions(updatedData.emojis);

      showToast({
        type: 'success',
        message: 'Đã cập nhật reaction!',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Failed to react:', error);
      
      if (error.response?.status === 401) {
        showToast({
          type: 'error',
          message: 'Vui lòng đăng nhập lại',
          duration: 3000,
        });
      } else {
        showToast({
          type: 'error',
          message: 'Không thể react, vui lòng thử lại',
          duration: 3000,
        });
      }
    } finally {
      setIsReacting(false);
    }
  };

  /**
   * @deprecated Use handleReactionClick with emojiId instead
   */
  const handleReact = handleReactionClick;

  return {
    reactions,
    isLoading,
    isReacting,
    handleReact,
    handleReactionClick,
    refetch: fetchReactions,
  };
};
