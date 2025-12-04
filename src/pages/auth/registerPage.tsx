import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// decorative GIF: try local `public/assets/auth-decor.gif`, fallback to external
const LOCAL_GIF = "/assets/auth-decor.gif";
const FALLBACK_GIF = "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gifSrc, setGifSrc] = useState(LOCAL_GIF);

  const validate = () => {
    if (!name) {
      setError("Name is required");
      return false;
    }
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      // on success, navigate to verify page if backend requires email verification
      // otherwise navigate to home
      navigate("/verify-email", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Registration failed"
      );
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
            Đăng ký
          </h2>
          <p className="text-sm text-gray-500 mb-6">Tạo tài khoản mới để bắt đầu</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="Nguyễn Văn A"
              />
            </div>

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
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2 font-bold text-white rounded-lg"
              style={{ background: "#F295B6" }}
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <NavLink to="/login" className="font-semibold text-[#F295B6]">
              Đăng nhập
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
