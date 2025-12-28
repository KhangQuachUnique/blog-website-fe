import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../../services/auth";
import { useToast } from "../../contexts/toast";

// decorative GIF: same style as login/register
const LOCAL_GIF = "/assets/auth-decor.gif";
const FALLBACK_GIF =
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [gifSrc, setGifSrc] = useState(LOCAL_GIF);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async () => {
    if (!email) {
      showToast({ type: "error", message: "Vui lòng nhập email" });
      return;
    }

    setSendingOtp(true);

    try {
      await authService.sendResetOtp(email);
      setStep("otp");
      showToast({
        type: "success",
        message: "Mã OTP đã được gửi đến email của bạn",
      });
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      showToast({
        type: "error",
        message:
          err?.response?.data?.message || err?.message || "Gửi OTP thất bại",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showToast({ type: "error", message: "Vui lòng nhập đủ 6 số OTP" });
      return;
    }
    setStep("password");
  };

  const validatePassword = () => {
    if (!newPassword) {
      showToast({ type: "error", message: "Vui lòng nhập mật khẩu mới" });
      return false;
    }
    if (newPassword.length < 8) {
      showToast({ type: "error", message: "Mật khẩu phải có ít nhất 8 ký tự" });
      return false;
    }
    if (newPassword.length > 50) {
      showToast({ type: "error", message: "Mật khẩu không được quá 50 ký tự" });
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      showToast({
        type: "error",
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      });
      return false;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: "error", message: "Mật khẩu không khớp" });
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    const otpCode = otp.join("");
    setLoading(true);

    try {
      await authService.resetPassword(email, otpCode, newPassword);
      showToast({ type: "success", message: "Đặt lại mật khẩu thành công!" });
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      showToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Đặt lại mật khẩu thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "email":
        return "QUÊN MẬT KHẨU";
      case "otp":
        return "Xác thực OTP";
      case "password":
        return "Đặt mật khẩu mới";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "email":
        return "Nhập email để nhận mã xác thực";
      case "otp":
        return `Nhập mã OTP đã gửi đến ${email}`;
      case "password":
        return "Nhập mật khẩu mới cho tài khoản của bạn";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8FB] px-4">
      <div className="w-full max-w-4xl bg-white border border-[#FFE4EC] rounded-3xl p-0 overflow-hidden flex flex-col md:flex-row">
        {/* Left decorative GIF */}
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
            className="text-3xl font-extrabold mb-2 text-center tracking-tight"
            style={{ color: "#8C1D35", letterSpacing: "-1px" }}
          >
            {getTitle()}
          </h2>
          <p className="text-base text-gray-500 mb-6 text-center">
            {getDescription()}
          </p>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Step 1: Email input */}
            {step === "email" && (
              <>
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
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full mt-2 py-2.5 font-bold text-white rounded-xl transition-all duration-150 bg-[#F295B6] hover:bg-[#F47C9B] focus:ring-2 focus:ring-[#F295B6] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingOtp ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </>
            )}

            {/* Step 2: OTP input */}
            {step === "otp" && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-center text-[#8C1D35]">
                    Mã OTP
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full mt-2 py-2.5 font-bold text-white rounded-xl transition-all duration-150 bg-[#F295B6] hover:bg-[#F47C9B] focus:ring-2 focus:ring-[#F295B6] focus:outline-none"
                >
                  Tiếp tục
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full py-2.5 font-medium text-[#F295B6] border border-[#F295B6] rounded-xl hover:bg-[#FFF8FB] transition-colors disabled:opacity-60"
                >
                  {sendingOtp ? "Đang gửi..." : "Gửi lại mã OTP"}
                </button>
              </>
            )}

            {/* Step 3: New password */}
            {step === "password" && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#8C1D35]">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() =>
                      showToast({
                        type: "info",
                        message:
                          "Mật khẩu phải có 8-50 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-[#FAD1E2] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD6E7] focus:border-[#FFD6E7] transition-all duration-150 text-base placeholder-gray-400"
                    placeholder="Tối thiểu 8 ký tự, có chữ hoa, thường và số"
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
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 font-bold text-white rounded-xl transition-all duration-150 bg-[#F295B6] hover:bg-[#F47C9B] focus:ring-2 focus:ring-[#F295B6] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Nhớ mật khẩu?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-[#F295B6] hover:underline"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
