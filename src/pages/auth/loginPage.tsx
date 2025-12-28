import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/toast";

// decorative GIF: try local `public/assets/auth-decor.gif`, fallback to external
const LOCAL_GIF = "/assets/auth-decor.gif";
const FALLBACK_GIF =
  "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gifSrc, setGifSrc] = useState(LOCAL_GIF);

  const validate = () => {
    if (!emailOrUsername) {
      showToast({
        type: "error",
        message: "Vui lòng nhập email hoặc username",
      });
      return false;
    }
    if (!password) {
      showToast({ type: "error", message: "Vui lòng nhập mật khẩu" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(emailOrUsername, password);
      showToast({ type: "success", message: "Đăng nhập thành công!" });
      navigate("/", { replace: true });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Đăng nhập thất bại";

      // Check if error is about email verification
      if (
        errorMessage.includes("chưa được xác thực") ||
        errorMessage.includes("not verified")
      ) {
        showToast({
          type: "info",
          message:
            "Email chưa được xác thực. Đang chuyển đến trang xác thực...",
        });
        // Try to extract email if it looks like email, otherwise just navigate
        const emailToVerify = emailOrUsername.includes("@")
          ? emailOrUsername
          : "";
        setTimeout(() => {
          navigate("/verify-email", { state: { email: emailToVerify } });
        }, 1500);
      } else {
        showToast({ type: "error", message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8FB] via-[#FFF0F6] to-[#FDE6F2] px-4">
      <div className="w-full max-w-4xl bg-white border border-[#FFE4EC] rounded-3xl p-0 overflow-hidden flex flex-col md:flex-row">
        {/* Left decorative GIF (hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#FFF8FB] p-8">
          <img
            src={gifSrc}
            alt="decor"
            className="w-full max-w-xs object-contain rounded-2xl"
            onError={() => setGifSrc(FALLBACK_GIF)}
          />
        </div>

        {/* Right: form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <h2
            className="text-4xl font-extrabold text-center tracking-tight mb-3"
            style={{ color: "#8C1D35", letterSpacing: "-1px" }}
          >
            ĐĂNG NHẬP
          </h2>
          <p className="text-base text-gray-500 mb-4 text-center font-medium">
            Chào mừng bạn quay trở lại!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#8C1D35]">
                Email hoặc Username
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                placeholder="you@example.com hoặc username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#8C1D35]">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 font-bold text-white rounded-xl transition-all duration-150 bg-[#F295B6] hover:bg-[#F47C9B] focus:ring-2 focus:ring-[#F295B6] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <NavLink
              to="/register"
              className="font-semibold text-[#F295B6] hover:underline"
            >
              Đăng ký
            </NavLink>
          </div>

          <div className="mt-2 text-center text-sm">
            <NavLink
              to="/forgot-password"
              className="font-semibold text-[#F295B6] hover:underline"
            >
              Quên mật khẩu?
            </NavLink>
          </div>

          <div className="mt-2 text-center text-sm">
            Chưa xác thực email?{" "}
            <NavLink
              to="/verify-email"
              className="font-semibold text-[#F295B6] hover:underline"
            >
              Xác thực ngay
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
