import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
};

const UnauthorizedPage: React.FC = () => {
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
      {/* 401 Illustration */}
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
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "120px",
              fontWeight: 800,
              color: THEME.primary,
              lineHeight: 1,
            }}
          >
            4
          </span>
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
            <AlertTriangle size={48} style={{ color: THEME.primary }} />
          </div>
          <span
            style={{
              fontSize: "120px",
              fontWeight: 800,
              color: THEME.primary,
              lineHeight: 1,
            }}
          >
            1
          </span>
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
        Chưa xác thực hoặc hết phiên đăng nhập
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
        Bạn cần đăng nhập để truy cập trang này. Nếu đã đăng nhập mà vẫn gặp
        lỗi, hãy thử đăng nhập lại.
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
          onClick={() => navigate("/")}
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
          <Home size={18} />
          Về trang chủ
        </button>
      </div>
      <div
        style={{
          marginTop: "48px",
          display: "flex",
          gap: "8px",
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: i === 2 ? THEME.primary : THEME.secondary,
            }}
          />
        ))}
      </div>
      <p
        style={{
          marginTop: "24px",
          fontSize: "13px",
          color: THEME.textMuted,
        }}
      >
        Mã lỗi: 401 - Unauthorized
      </p>
    </div>
  );
};

export default UnauthorizedPage;
