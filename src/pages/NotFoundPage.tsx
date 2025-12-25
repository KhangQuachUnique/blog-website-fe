import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react";

// ============================================
// 🎨 BLOOKIE DESIGN SYSTEM - PASTEL PINK EDITION
// ============================================
const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
};

// ============================================
// 404 NOT FOUND PAGE
// ============================================
const NotFoundPage: React.FC = () => {
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
      {/* 404 Illustration */}
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
            <AlertCircle size={48} style={{ color: THEME.primary }} />
          </div>
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
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: THEME.text,
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        Oops! Trang không tồn tại
      </h1>

      {/* Description */}
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
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Go Back Button */}
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

        {/* Home Button */}
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

        {/* Search Button */}
        <button
          onClick={() => navigate("/search")}
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
          <Search size={18} />
          Tìm kiếm
        </button>
      </div>

      {/* Decorative Elements */}
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

      {/* Footer Text */}
      <p
        style={{
          marginTop: "24px",
          fontSize: "13px",
          color: THEME.textMuted,
        }}
      >
        Mã lỗi: 404 - Not Found
      </p>
    </div>
  );
};

export default NotFoundPage;
