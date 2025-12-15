import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as authService from "../../services/auth";
import { useToast } from "../../contexts/toast";

// decorative GIF: same style as login/register
const LOCAL_GIF = "/assets/auth-decor.gif";
const FALLBACK_GIF = "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state (passed from register page)
  const emailFromState = location.state?.email || "";
  
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { showToast } = useToast();
  const [gifSrc, setGifSrc] = useState(LOCAL_GIF);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP if email is provided from register
  useEffect(() => {
    if (emailFromState && !otpSent) {
      handleSendOtp();
    }
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      showToast({ type: "error", message: "Vui lòng nhập email" });
      return;
    }
    
    setSendingOtp(true);
    
    try {
      await authService.sendOtp(email);
      setOtpSent(true);
      showToast({ type: "success", message: "Mã OTP đã được gửi đến email của bạn" });
      // Focus first OTP input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Gửi OTP thất bại"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace - go to previous input
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
    
    // Focus last filled input or next empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showToast({ type: "error", message: "Vui lòng nhập đủ 6 số OTP" });
      return;
    }
    
    setLoading(true);
    
    try {
      await authService.verifyOtp(email, otpCode);
      showToast({ type: "success", message: "Xác thực email thành công!" });
      // Navigate to login after success
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      showToast({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Xác thực thất bại"
      });
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
            Xác thực Email
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {otpSent 
              ? `Nhập mã OTP đã gửi đến ${email}` 
              : "Nhập email để nhận mã xác thực"}
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            {/* Email input - shown only if OTP not sent */}
            {!otpSent && (
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
            )}

            {/* OTP inputs - shown after OTP sent */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium mb-3 text-center">Mã OTP</label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6] focus:border-[#F295B6]"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full mt-2 py-2 font-bold text-white rounded-lg transition-opacity disabled:opacity-60"
                style={{ background: "#F295B6" }}
              >
                {sendingOtp ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2 font-bold text-white rounded-lg transition-opacity disabled:opacity-60"
                  style={{ background: "#F295B6" }}
                >
                  {loading ? "Đang xác thực..." : "Xác thực"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full py-2 font-medium text-[#F295B6] border border-[#F295B6] rounded-lg hover:bg-[#FFF8FB] transition-colors disabled:opacity-60"
                >
                  {sendingOtp ? "Đang gửi..." : "Gửi lại mã OTP"}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã xác thực?{" "}
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

export default VerifyEmailPage;
