import React from 'react';
import { Snackbar } from '@mui/material';

interface ToastProps {
  open: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
  position?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' };
}

// Bloogie theme colors
const colorMap = {
  success: {
    bg: '#10B981',
    icon: '✓',
  },
  error: {
    bg: '#EF4444',
    icon: '✕',
  },
  info: {
    bg: '#3B82F6',
    icon: 'ℹ',
  },
  warning: {
    bg: '#F59E0B',
    icon: '⚠',
  },
};

const Toast: React.FC<ToastProps> = ({
  open,
  type,
  message,
  onClose,
  duration = 3000,
  position = { vertical: 'top', horizontal: 'right' },
}) => {

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(400px);
              opacity: 0;
            }
          }

          .toast-slide-in {
            animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }

          .toast-slide-out {
            animation: slideOutRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
        `}
      </style>
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={onClose}
        anchorOrigin={position}
        TransitionProps={{
          onExited: () => {
            // Remove slide-out class after animation
          },
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'transparent',
            padding: 0,
          },
        }}
      >
        <div
          className="toast-slide-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: colorMap[type].bg,
            color: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          <span style={{ fontSize: '18px' }}>{colorMap[type].icon}</span>
          {message}
        </div>
      </Snackbar>
    </>
  );
};

export default Toast;
