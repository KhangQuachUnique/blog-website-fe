import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";

const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
};

const LoginRequiredPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: THEME.cream,
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      {/* Illustration */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: `6px solid ${THEME.primary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: THEME.white,
          }}
        >
          <LogIn size={48} style={{ color: THEME.primary }} />
        </div>
      </div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: THEME.text,
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        Bạn cần đăng nhập để sử dụng tính năng này
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: THEME.textMuted,
          textAlign: "center",
          maxWidth: "400px",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        Vui lòng đăng nhập để tiếp tục. Nếu bạn chưa có tài khoản, hãy đăng ký
        mới.
      </p>
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            border: `2px solid ${THEME.secondary}`,
            borderRadius: "12px",
            background: THEME.white,
            color: THEME.text,
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Quicksand', sans-serif",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = THEME.tertiary;
            e.currentTarget.style.borderColor = THEME.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = THEME.white;
            e.currentTarget.style.borderColor = THEME.secondary;
          }}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <button
          onClick={() => navigate("/login")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            border: "none",
            borderRadius: "12px",
            background: THEME.primary,
            color: THEME.white,
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Quicksand', sans-serif",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#E8779F";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = THEME.primary;
          }}
        >
          <LogIn size={18} />
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default LoginRequiredPage;
