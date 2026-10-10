import { useState } from "react";
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
  UserCheck,
  Copy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const {
    login,
    signup,
    loginWithGoogle,
    loginDemo,
    verifyAccount,
    resendVerificationToken,
  } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "bg-gray-600" };
    let s = 0;
    if (pwd.length >= 6) s += 1;
    if (pwd.length >= 10) s += 1;
    if (/[A-Z]/.test(pwd)) s += 1;
    if (/[0-9]/.test(pwd)) s += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 1;

    if (s <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (s <= 3) return { score: 2, label: "Medium", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-[#1DB954]" };
  };

  const pwdStrength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name.");
        await signup({ name, email, password, inviteCode });
        // Auto-logged in upon signup!
      } else if (mode === "verify") {
        if (!tokenInput.trim()) throw new Error("Please paste your JWT verification token.");
        const res = await verifyAccount(tokenInput);
        setSuccessMsg(res?.message || "Account verified! You can now log in.");
        setMode("login");
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err?.message || "Google sign-in was canceled.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDemoLogin(role = "user") {
    setError("");
    setBusy(true);
    try {
      await loginDemo(role);
    } catch (err) {
      setError(err?.message || "Demo login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4 py-12 selection:bg-[#1DB954] selection:text-black">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1DB954]/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/20 mb-3 hover:scale-105 transition-transform">
            <Droplets size={28} className="text-black" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {mode === "signup" ? "Sign up to start saving water" : mode === "verify" ? "Verify your account" : "Log in to JalLoop"}
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">
            Smart IoT Water Recycling &amp; Telemetry Management
          </p>
        </div>

        {/* Spotify-style Centered Auth Card */}
        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
              <Check size={16} className="text-[#1DB954] shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 bg-red-950/80 border border-red-500/50 rounded-xl p-3.5 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Authentication issue</span>
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Top Social & One-Click Buttons (Spotify Style) */}
          {mode !== "verify" && (
            <div className="space-y-2.5 mb-6">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-gray-600 bg-transparent hover:border-white hover:bg-white/5 transition-all text-sm font-bold text-white cursor-pointer disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* 1-Click Demo Resident Login */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("user")}
                  disabled={busy}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border border-gray-600 bg-transparent hover:border-[#1DB954] hover:text-[#1DB954] hover:bg-[#1DB954]/5 transition-all text-xs font-bold text-gray-300 cursor-pointer disabled:opacity-50"
                  title="Instant login as demo resident"
                >
                  <Sparkles size={14} className="text-[#1DB954]" />
                  <span>Demo User</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={busy}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border border-gray-600 bg-transparent hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 transition-all text-xs font-bold text-gray-300 cursor-pointer disabled:opacity-50"
                  title="Instant login as facility admin"
                >
                  <Shield size={14} className="text-amber-400" />
                  <span>Demo Admin</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-[#2e2e2e]" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">or</span>
                <div className="flex-1 h-[1px] bg-[#2e2e2e]" />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  What should we call you?
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full bg-[#121212] border border-[#3e3e3e] focus:border-white rounded-lg px-3.5 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">This will appear on your JalLoop dashboard.</p>
              </div>
            )}

            {mode !== "verify" && (
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  autoComplete="email"
                  className="w-full bg-[#121212] border border-[#3e3e3e] focus:border-white rounded-lg px-3.5 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>
            )}

            {mode !== "verify" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setError("For testing, sign up with any email or use the 1-Click Demo login above!")}
                      className="text-[11px] text-gray-400 hover:text-white underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="w-full bg-[#121212] border border-[#3e3e3e] focus:border-white rounded-lg pl-3.5 pr-10 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password strength meter on signup */}
                {mode === "signup" && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Password strength:</span>
                      <span className="font-bold text-white">{pwdStrength.label}</span>
                    </div>
                    <div className="w-full bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                        style={{ width: `${(pwdStrength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Admin Invite Code <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter code if you are a facility admin"
                  autoComplete="off"
                  className="w-full bg-[#121212] border border-[#3e3e3e] focus:border-white rounded-lg px-3.5 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors font-mono"
                />
              </div>
            )}

            {/* Remember me toggle on login */}
            {mode === "login" && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#121212] border-[#3e3e3e] text-[#1DB954] accent-[#1DB954] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-gray-300 select-none cursor-pointer">
                  Remember me on this browser
                </label>
              </div>
            )}

            {/* Manual JWT Verification Tab Mode */}
            {mode === "verify" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Paste Signed RFC 7519 JWT Token
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-[#121212] border border-[#3e3e3e] focus:border-white rounded-lg p-3 text-xs font-mono text-emerald-400 placeholder-gray-600 outline-none resize-none break-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Evaluates cryptographic signature and activates account immediately.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-xs text-gray-400 hover:text-white underline block"
                >
                  &larr; Back to standard login
                </button>
              </div>
            )}

            {/* Signature Spotify-Style Pill Action Button */}
            <button
              type="submit"
              disabled={busy}
              className="w-full mt-4 py-3.5 px-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-102 active:scale-98 transition-all text-black font-extrabold text-sm tracking-wide shadow-lg shadow-[#1DB954]/20 cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Sign Up" : mode === "verify" ? "Verify Token & Log In" : "Log In"}
            </button>
          </form>

          {/* Footer Navigation Switcher */}
          <div className="mt-8 pt-6 border-t border-[#282828] text-center">
            {mode === "login" ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">
                  Don't have an account?
                </p>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
                  className="w-full py-3 px-4 rounded-full border border-gray-600 hover:border-white bg-transparent hover:bg-white/5 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  Sign up for JalLoop
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                  className="font-bold text-white underline hover:text-[#1DB954] ml-1 cursor-pointer"
                >
                  Log in here
                </button>
              </p>
            )}

            {/* Subtle link for manual JWT testing */}
            {mode !== "verify" && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => { setMode("verify"); setError(""); setSuccessMsg(""); }}
                  className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                >
                  Security testing? <span className="underline">Verify a raw JWT token manually</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legal & Terms */}
        <p className="text-center text-[11px] text-gray-500 mt-6 leading-relaxed">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
      </div>
    </div>
  );
}
