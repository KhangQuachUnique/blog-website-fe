import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/toast";

// decorative GIF: try local `public/assets/auth-decor.gif`, fallback to external
const LOCAL_GIF = "/assets/auth-decor.gif";
const FALLBACK_GIF =
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gifSrc, setGifSrc] = useState(LOCAL_GIF);

  const validate = () => {
    if (!name) {
      showToast({ type: "error", message: "Vui lòng nhập họ tên" });
      return false;
    }
    if (!email) {
      showToast({ type: "error", message: "Vui lòng nhập email" });
      return false;
    }
    if (!password) {
      showToast({ type: "error", message: "Vui lòng nhập mật khẩu" });
      return false;
    }
    if (password.length < 8) {
      showToast({ type: "error", message: "Mật khẩu phải có ít nhất 8 ký tự" });
      return false;
    }
    if (password.length > 50) {
      showToast({ type: "error", message: "Mật khẩu không được quá 50 ký tự" });
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      showToast({
        type: "error",
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      });
      return false;
    }
    if (password !== confirmPassword) {
      showToast({ type: "error", message: "Mật khẩu không khớp" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name, email, password);
      showToast({
        type: "success",
        message: "Đăng ký thành công! Vui lòng xác thực email.",
      });
      // Navigate to verify page with email
      navigate("/verify-email", { replace: true, state: { email } });
    } catch (err: any) {
      showToast({
        type: "error",
        message:
          err?.response?.data?.message || err?.message || "Đăng ký thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8FB] px-4">
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
            className="text-4xl font-black mb-2 text-center tracking-tight"
            style={{ color: "#8C1D35", letterSpacing: "-1px" }}
          >
            ĐĂNG KÝ
          </h2>
          <p className="text-base text-gray-500 mb-4 text-center font-medium">
            Tạo tài khoản mới để bắt đầu
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[#8C1D35]">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#8C1D35]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                placeholder="you@example.com"
                autoComplete="email"
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
                onFocus={() =>
                  showToast({
                    type: "info",
                    message:
                      "Mật khẩu phải có 8-50 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                placeholder="Tối thiểu 8 ký tự, có chữ hoa, thường và số"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-[#8C1D35]">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 font-bold text-white rounded-xl transition-all duration-150 bg-[#F295B6] hover:bg-[#F47C9B] focus:ring-2 focus:ring-[#F295B6] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <NavLink
              to="/login"
              className="font-semibold text-[#F295B6] hover:underline"
            >
              Đăng nhập
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
