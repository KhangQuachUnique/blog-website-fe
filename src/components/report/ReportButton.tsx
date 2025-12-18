import React, { useState, useCallback } from 'react';
import { Flag } from 'lucide-react';
import ReportModal from './ReportModal';
import { useCreateReport } from '../../hooks/useReport';
import type { EReportType, ReportReasonValue } from '../../types/report';
import { EReportType as ReportType } from '../../types/report';

// ============================================
// 🎨 THEME
// ============================================
const THEME = {
  primary: '#F295B6',
  secondary: '#FFB8D1',
  tertiary: '#FFE7F0',
  text: '#4A3C42',
  white: '#FFFFFF',
  danger: '#E57373',
  shadowSoft: '0 2px 12px rgba(242, 149, 182, 0.15)',
};

// ============================================
// 🚨 TYPES
// ============================================
export interface ReportButtonProps {
  /** Loại đối tượng báo cáo */
  type: EReportType;
  /** ID của đối tượng (postId/commentId/userId) */
  targetId: number;
  /** ID của người dùng hiện tại (0 nếu chưa đăng nhập) */
  currentUserId: number;
  /** Render custom button */
  renderButton?: (props: { onClick: () => void; isDisabled: boolean }) => React.ReactNode;
  /** Hiển thị label hay không */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
  /** Callback khi đóng modal */
  onClose?: () => void;
  /** Callback khi report thành công */
  onSuccess?: () => void;
  /** Show login required message */
  onLoginRequired?: () => void;
}

// ============================================
// 🚨 REPORT BUTTON COMPONENT
// ============================================
const ReportButton: React.FC<ReportButtonProps> = ({
  type,
  targetId,
  currentUserId,
  renderButton,
  showLabel = false,
  className,
  onClose,
  onSuccess,
  onLoginRequired,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isLoggedIn = currentUserId > 0;

  const { mutate: createReport, isPending } = useCreateReport({
    onSuccess: () => {
      setIsModalOpen(false);
      onSuccess?.();
    },
  });

  // Handle button click
  const handleClick = useCallback(() => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    setIsModalOpen(true);
  }, [isLoggedIn, onLoginRequired]);

  // Handle submit report
  const handleSubmit = useCallback((reason: ReportReasonValue, customReason?: string) => {
    const finalReason = reason === 'OTHER' && customReason ? customReason : reason;

    const payload: any = {
      reason: finalReason,
      type,
    };

    // Set target ID based on type
    switch (type) {
      case ReportType.POST:
        payload.reportedPostId = targetId;
        break;
      case ReportType.COMMENT:
        payload.reportedCommentId = targetId;
        break;
      case ReportType.USER:
        payload.reportedUserId = targetId;
        break;
    }

    createReport(payload);
  }, [type, targetId, createReport]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    onClose?.();
  }, [onClose]);

  // Get label text based on type
  const getLabel = () => {
    switch (type) {
      case ReportType.POST:
        return 'Báo cáo bài viết';
      case ReportType.COMMENT:
        return 'Báo cáo bình luận';
      case ReportType.USER:
        return 'Báo cáo người dùng';
      default:
        return 'Báo cáo';
    }
  };

  // Custom render
  if (renderButton) {
    return (
      <>
        {renderButton({ onClick: handleClick, isDisabled: isPending })}
        <ReportModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          isLoading={isPending}
          type={type}
        />
      </>
    );
  }

  // Default button
  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: showLabel ? '8px' : '0',
          padding: showLabel ? '8px 16px' : '8px',
          background: isHovered ? THEME.tertiary : 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.5 : 1,
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: THEME.danger,
          transition: 'all 0.2s ease',
        }}
        title={getLabel()}
      >
        <Flag size={16} strokeWidth={2.5} />
        {showLabel && <span>{getLabel()}</span>}
      </button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        isLoading={isPending}
        type={type}
      />
    </>
  );
};

export default ReportButton;
