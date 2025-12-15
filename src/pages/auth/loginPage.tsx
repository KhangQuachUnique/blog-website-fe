import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/toast";

// decorative GIF: try local `public/assets/auth-decor.gif`, fallback to external
const LOCAL_GIF = "/assets/auth-decor.gif";
const FALLBACK_GIF = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gifSrc, setGifSrc] = useState(LOCAL_GIF);

  const validate = () => {
    if (!email) {
      showToast({ type: "error", message: "Vui lòng nhập email" });
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
      await login(email, password);
      showToast({ type: "success", message: "Đăng nhập thành công!" });
      navigate("/", { replace: true });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
      
      // Check if error is about email verification
      if (errorMessage.includes("chưa được xác thực") || errorMessage.includes("not verified")) {
        showToast({ type: "info", message: "Email chưa được xác thực. Đang chuyển đến trang xác thực..." });
        setTimeout(() => {
          navigate("/verify-email", { state: { email } });
        }, 1500);
      } else {
        showToast({ type: "error", message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-4xl bg-white border border-[#FFE4EC] rounded-2xl shadow-sm p-2 overflow-hidden flex flex-col md:flex-row">
        {/* Left decorative GIF (hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-[#FFF8FB] p-6">
          <img
            src={gifSrc}
            alt="decor"
            className="w-full max-w-sm object-contain"
            onError={() => setGifSrc(FALLBACK_GIF)}
          />
        </div>

        {/* Right: form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#8C1D35" }}>
            Đăng nhập
          </h2>
          <p className="text-sm text-gray-500 mb-6">Đăng nhập vào tài khoản của bạn</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 font-bold text-white rounded-lg"
              style={{ background: "#F295B6" }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <NavLink to="/register" className="font-semibold text-[#F295B6]">
              Đăng ký
            </NavLink>
          </div>

          <div className="mt-2 text-center text-sm text-gray-600">
            Chưa xác thực email?{' '}
            <NavLink to="/verify-email" className="font-semibold text-[#F295B6]">
              Xác thực ngay
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
