import { useState, useEffect, useCallback } from 'react';
import { reactWithEmoji, getEmojiBar, type EmojiReaction } from '../services/user/reactions/reactionService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/toast';

interface UsePostReactionsOptions {
  postId: number;
  enabled?: boolean;
}

export const usePostReactions = ({ postId, enabled = true }: UsePostReactionsOptions) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    if (!enabled || hasLoaded) return;

    setIsLoading(true);
    try {
      const data = await getEmojiBar('post', postId, user?.id);
      setReactions(data.reactions);
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

  // Handle emoji reaction
  const handleReact = async (unicodeCodepoint: string) => {
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
      const response = await reactWithEmoji({
        userId: user.id,
        unicodeCodepoint,
        targetType: 'post',
        postId,
      });

      // Update reactions from response
      setReactions(response.data.reactions);

      showToast({
        type: 'success',
        message: 'Đã react!',
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

  // Handle clicking on existing reaction (toggle or change)
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
      const response = await reactWithEmoji({
        userId: user.id,
        emojiId,
        targetType: 'post',
        postId,
      });

      // Update reactions from response
      setReactions(response.data.reactions);
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

  return {
    reactions,
    isLoading,
    isReacting,
    handleReact,
    handleReactionClick,
    refetch: fetchReactions,
  };
};
