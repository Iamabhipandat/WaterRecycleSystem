import { useState, useRef, useEffect } from "react";
import {
  Droplets,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  KeyRound,
  ArrowRight,
  Mail,
  ChevronLeft,
  RotateCcw,
  Lock,
  User,
  Copy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const {
    login,
    signup,
    requestSignupVerification,
    confirmSignupVerification,
    requestLoginVerification,
    confirmLoginVerification,
    resendSignupCode,
    loginWithGoogle,
    loginDemo,
  } = useAuth();

  // Mode: "login" | "signup"
  const [tab, setTab] = useState("login");
  // Step: "form" | "verify"
  const [step, setStep] = useState("form");
  // Login type: "password" | "code"
  const [loginMethod, setLoginMethod] = useState("password");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteField, setShowInviteField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 6-digit verification code states
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeCode, setActiveCode] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Status & loading
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const otpInputsRef = useRef([]);

  // Countdown timer for code resend
  useEffect(() => {
    let timer;
    if (step === "verify" && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Focus first input on entering verification step
  useEffect(() => {
    if (step === "verify" && otpInputsRef.current[0]) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    }
  }, [step]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-gray-200" };
    let s = 0;
    if (pwd.length >= 6) s += 1;
    if (pwd.length >= 10) s += 1;
    if (/[A-Z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 1;

    if (s <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (s <= 3) return { score: 2, label: "Medium", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-600" };
  };

  const pwdStrength = getPasswordStrength(password);

  // OTP input handlers (individual boxes with auto-focus & paste support)
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    const combined = newOtp.join("");
    if (combined.length === 6 && !newOtp.includes("")) {
      handleVerifyCode(combined);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIdx = Math.min(5, pasted.length);
    otpInputsRef.current[nextIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyCode(pasted);
    }
  };

  const handleAutoFillCode = () => {
    if (!activeCode) return;
    const digits = activeCode.split("").slice(0, 6);
    setOtp(digits);
    handleVerifyCode(activeCode);
  };

  // Step 1: Submit Form (Login or Start Signup Verification)
  async function handleFormSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);

    try {
      if (tab === "signup") {
        // Step 1 of Signup: Request 6-digit code
        const res = await requestSignupVerification({ name, email, password, inviteCode });
        setActiveCode(res.code);
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(30);
        setCanResend(false);
        setStep("verify");
      } else {
        // Login Flow
        if (loginMethod === "code") {
          // Request 6-digit login code
          const res = await requestLoginVerification(email);
          setActiveCode(res.code);
          setOtp(["", "", "", "", "", ""]);
          setResendTimer(30);
          setCanResend(false);
          setStep("verify");
        } else {
          // Direct password login
          await login({ email, password });
        }
      }
    } catch (err) {
      setError(err?.message || "Authentication failed. Please verify your details.");
    } finally {
      setBusy(false);
    }
  }

  // Step 2: Verify 6-digit Code (Both Signup and Login)
  async function handleVerifyCode(codeToVerify) {
    const code = codeToVerify || otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      if (tab === "signup") {
        await confirmSignupVerification({ email, code });
      } else {
        await confirmLoginVerification({ email, code });
      }
      // Successfully verified and automatically logged into dashboard!
    } catch (err) {
      setError(err?.message || "Invalid verification code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Resend code handler
  async function handleResendCode() {
    if (!canResend) return;
    setError("");
    setBusy(true);
    try {
      let newCode = "";
      if (tab === "signup") {
        newCode = await resendSignupCode(email);
      } else {
        const res = await requestLoginVerification(email);
        newCode = res.code;
      }
      setActiveCode(newCode);
      setResendTimer(30);
      setCanResend(false);
      setSuccessMsg("A new 6-digit verification code has been sent!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.message || "Could not resend code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center px-4 py-10 text-gray-900">
      <div className="w-full max-w-[460px]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-green-700 flex items-center justify-center shadow-md shadow-green-700/20 mb-3">
            <Droplets size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            JalLoop
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Smart Water Recycling &amp; Telemetry Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* =========================================================================
              VIEW 1: FORM INPUTS (Login or Sign Up Details)
          ========================================================================= */}
          {step === "form" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Tab Selector: Log In vs Sign Up */}
              <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tab === "login"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tab === "signup"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {tab === "signup" ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {tab === "signup"
                    ? "Enter your details to receive a 6-digit verification code"
                    : loginMethod === "code"
                    ? "Log in securely using a 6-digit email code"
                    : "Enter your email and password to access your dashboard"}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Social & 1-Click Fast Access */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-xs font-bold text-gray-700 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => loginDemo("user")}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-green-50 hover:border-green-300 hover:text-green-800 transition-colors text-xs font-bold text-gray-600 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={13} className="text-green-600" />
                    <span>Demo Resident</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginDemo("admin")}
                    disabled={busy}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors text-xs font-bold text-gray-600 cursor-pointer disabled:opacity-50"
                  >
                    <Shield size={13} className="text-amber-600" />
                    <span>Demo Admin</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-gray-200" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">or email</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              {/* Form Fields */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {tab === "signup" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600 bg-gray-50/50">
                      <User size={15} className="text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        autoComplete="name"
                        className="w-full text-xs font-medium outline-none bg-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600 bg-gray-50/50">
                    <Mail size={15} className="text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      autoComplete="email"
                      className="w-full text-xs font-medium outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Password field (shown on signup or password-mode login) */}
                {(tab === "signup" || loginMethod === "password") && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">Password</label>
                      {tab === "login" && (
                        <button
                          type="button"
                          onClick={() => setLoginMethod("code")}
                          className="text-[11px] font-bold text-green-700 hover:text-green-800 underline cursor-pointer"
                        >
                          Log in with 6-digit code instead
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600 bg-gray-50/50">
                      <Lock size={15} className="text-gray-400 shrink-0 mr-2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Letters & numbers (min 6 chars)"
                        minLength={6}
                        autoComplete={tab === "signup" ? "new-password" : "current-password"}
                        className="w-full text-xs font-medium outline-none bg-transparent pr-7"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength bar for signup */}
                    {tab === "signup" && password && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-400 font-medium">Password strength:</span>
                          <span className="font-bold text-gray-700">{pwdStrength.label}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                            style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Switch back to password if on code login */}
                {tab === "login" && loginMethod === "code" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setLoginMethod("password")}
                      className="text-[11px] font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                    >
                      Use password instead
                    </button>
                  </div>
                )}

                {/* Optional Admin Code for Signup */}
                {tab === "signup" && (
                  <div>
                    {!showInviteField ? (
                      <button
                        type="button"
                        onClick={() => setShowInviteField(true)}
                        className="text-[11px] font-bold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                      >
                        + Have an admin invite code?
                      </button>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Admin Invite Code
                        </label>
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          placeholder="Optional admin key"
                          className="w-full text-xs font-mono border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Submit Button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full mt-2 py-3 px-5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <span>
                    {busy
                      ? "Please wait…"
                      : tab === "signup"
                      ? "Continue & Send Verification Code"
                      : loginMethod === "code"
                      ? "Send 6-Digit Login Code"
                      : "Log In to JalLoop"}
                  </span>
                  {!busy && <ArrowRight size={14} />}
                </button>
              </form>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: 6-DIGIT VERIFICATION VIEW (Spotify-Style Code Screen)
          ========================================================================= */}
          {step === "verify" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                }}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              {/* Title & Email indication */}
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center justify-center mx-auto mb-2">
                  <Mail size={22} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Enter your 6-digit code
                </h2>
                <p className="text-xs text-gray-500">
                  We sent a verification code to{" "}
                  <span className="font-bold text-gray-800">{email}</span>
                </p>
              </div>

              {/* Success notification */}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error notification */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={14} className="text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Live Email Notification Simulation Card */}
              {activeCode && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Mail size={13} className="text-blue-600" />
                      Verification Code Generated:
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFillCode}
                      className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      ⚡ Auto-fill Code
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-blue-100 font-mono">
                    <span className="text-base font-black text-blue-700 tracking-widest">
                      {activeCode}
                    </span>
                    <span className="text-[10px] text-gray-400">Valid for 10 minutes</span>
                  </div>
                </div>
              )}

              {/* 6 Individual OTP Boxes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
                  Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-xl border transition-all outline-none ${
                        digit
                          ? "border-green-600 bg-green-50/40 text-green-900"
                          : "border-gray-200 bg-gray-50/80 text-gray-900 focus:border-green-600 focus:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify & Complete Button */}
              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={busy || otp.join("").length < 6}
                className="w-full py-3 px-5 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{busy ? "Verifying…" : "Verify Code & Access JalLoop"}</span>
                {!busy && <Check size={15} />}
              </button>

              {/* Resend & Edit Email Footer */}
              <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2 text-xs">
                {resendTimer > 0 ? (
                  <p className="text-gray-400 font-medium">
                    Resend code in <span className="font-bold text-gray-700 font-mono">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={busy}
                    className="text-green-700 hover:text-green-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Resend verification code</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-[11px] underline cursor-pointer"
                >
                  Entered the wrong email? Change it here
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-400 mt-5">
          JalLoop Smart Water Recycling • Secured by RFC 7519 HMAC-SHA256 Token Verification
        </p>
      </div>
    </div>
  );
}
