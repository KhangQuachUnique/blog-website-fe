import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { REPORT_REASONS, EReportType, type ReportReasonValue } from '../../types/report';

// ============================================
// 🎨 THEME
// ============================================
const THEME = {
  primary: '#F295B6',
  secondary: '#FFB8D1',
  tertiary: '#FFE7F0',
  cream: '#FFF8FA',
  text: '#4A3C42',
  textMuted: '#8B7B82',
  white: '#FFFFFF',
  danger: '#E57373',
  shadowStrong: '0 8px 32px rgba(242, 149, 182, 0.25)',
};

// ============================================
// 🚨 TYPES
// ============================================
export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReasonValue, customReason?: string) => void;
  isLoading?: boolean;
  type: EReportType;
}

// ============================================
// 🚨 REPORT MODAL COMPONENT
// ============================================
const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  type,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReasonValue | null>(null);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  // Get title based on type
  const getTitle = () => {
    switch (type) {
      case EReportType.POST:
        return 'Báo cáo bài viết';
      case EReportType.COMMENT:
        return 'Báo cáo bình luận';
      case EReportType.USER:
        return 'Báo cáo người dùng';
      default:
        return 'Báo cáo';
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (!selectedReason) return;
    
    if (selectedReason === 'OTHER' && !customReason.trim()) {
      return; // Don't submit if OTHER selected but no custom reason
    }

    onSubmit(selectedReason, customReason.trim() || undefined);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const modal = (
    <>
      <style>{`
        @keyframes reportModalFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes reportModalSlideIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(74, 60, 66, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'reportModalFadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflow: 'auto',
          background: THEME.white,
          borderRadius: '20px',
          border: `2px solid ${THEME.secondary}`,
          boxShadow: THEME.shadowStrong,
          zIndex: 1001,
          animation: 'reportModalSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${THEME.tertiary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} style={{ color: THEME.danger }} />
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: THEME.text,
              }}
            >
              {getTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: THEME.tertiary,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={16} style={{ color: THEME.text }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: THEME.textMuted,
              lineHeight: 1.5,
            }}
          >
            Vui lòng chọn lý do báo cáo. Báo cáo của bạn sẽ được xem xét và xử lý trong thời gian sớm nhất.
          </p>

          {/* Reason Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1.5px solid ${selectedReason === reason.value ? THEME.primary : THEME.tertiary}`,
                  background: selectedReason === reason.value ? THEME.cream : THEME.white,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={() => setSelectedReason(reason.value)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: THEME.primary,
                    cursor: 'pointer',
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: selectedReason === reason.value ? 600 : 500,
                    color: THEME.text,
                  }}
                >
                  {reason.label}
                </span>
              </label>
            ))}
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'OTHER' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Mô tả chi tiết lý do báo cáo..."
              maxLength={500}
              style={{
                width: '100%',
                minHeight: '100px',
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${THEME.secondary}`,
                background: THEME.cream,
                fontFamily: "'Quicksand', sans-serif",
                fontSize: '14px',
                color: THEME.text,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            padding: '16px 20px',
            borderTop: `1px solid ${THEME.tertiary}`,
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '12px',
              border: `1.5px solid ${THEME.secondary}`,
              background: THEME.white,
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: THEME.text,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isLoading || (selectedReason === 'OTHER' && !customReason.trim())}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: !selectedReason || isLoading || (selectedReason === 'OTHER' && !customReason.trim())
                ? THEME.textMuted
                : THEME.danger,
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: THEME.white,
              cursor: !selectedReason || isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            Gửi báo cáo
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
};

export default ReportModal;
