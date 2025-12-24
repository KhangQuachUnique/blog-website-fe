import React from "react";
import { useLoginRequired } from "../../hooks/useLoginRequired";

// Re-export hook for convenience
export { useLoginRequired } from "../../hooks/useLoginRequired";

/**
 * Component Button với kiểm tra đăng nhập tích hợp
 */
interface LoginRequiredButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  loginMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const LoginRequiredButton: React.FC<LoginRequiredButtonProps> = ({
  children,
  onClick,
  loginMessage,
  className,
  style,
  disabled,
}) => {
  const { requireLogin } = useLoginRequired();

  const handleClick = () => {
    if (!requireLogin({ message: loginMessage })) return;
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default LoginRequiredButton;
