import { useState } from "react";
import { Check, Droplets, Lock, Mail, Shield, User, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function mapAuthError(err) {
  const msg = err?.message || "";
  if (msg.includes("already registered") || msg.includes("already exists"))
    return "That email already has an account. Please log in.";
  if (msg.includes("Invalid email")) return "Enter a valid email address.";
  if (msg.includes("Password") || msg.includes("password"))
    return msg;
  if (msg.includes("Invalid login") || msg.includes("Invalid email or password"))
    return "Email or password is incorrect.";
  if (msg.includes("Email not confirmed") || msg.includes("not verified"))
    return "Email not verified yet. Check your inbox for the verification link.";
  if (msg.includes("rate") || msg.includes("too many"))
    return "Too many attempts. Wait a moment and try again.";
  return msg || "Something went wrong. Try again.";
}

export default function AuthPage() {
  const { login, signup, resendVerificationEmail } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name.");
        const res = await signup({ name, email, password, inviteCode });
        if (res?.requireVerification) {
          setSuccessMsg(
            res.message || "Account created! Check your email for a verification link.",
          );
          setShowVerifyBanner(true);
        }
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(mapAuthError(err));
      if (
        err?.message?.includes("Email not confirmed") ||
        err?.message?.includes("not verified")
      ) {
        setShowVerifyBanner(true);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    setSuccessMsg("");
    setBusy(true);
    try {
      if (!email) throw new Error("Please enter your registered email address.");
      await resendVerificationEmail(email);
      setSuccessMsg("Verification email sent! Check your inbox (and spam folder).");
    } catch (err) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center shadow-sm">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">JalLoop</h1>
            <p className="text-xs text-gray-500 font-medium">Smart Water Recycling System</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Check size={14} className="text-emerald-600" />
                Success
              </p>
              <p>{successMsg}</p>
            </div>
          )}

          {/* Verification Banner */}
          {showVerifyBanner && (
            <div className="mb-4 bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-sky-800">
                <MailCheck size={14} className="text-sky-600" />
                Email Verification Required
              </p>
              <p>
                We sent a verification link to <strong>{email || "your email"}</strong>. Click
                the link in the email to activate your account, then come back and log in.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={busy || !email}
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 underline disabled:opacity-50"
              >
                Resend verification email
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 space-y-2">
              <p className="font-semibold text-red-900">Authentication Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </span>
                <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600">
                  <User size={15} className="text-gray-400" />
                  <input
                    className="w-full text-sm outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </span>
              <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600">
                <Mail size={15} className="text-gray-400" />
                <input
                  className="w-full text-sm outline-none"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Password
              </span>
              <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600">
                <Lock size={15} className="text-gray-400" />
                <input
                  className="w-full text-sm outline-none"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Letters & numbers (min 6 chars)"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
              </div>
              {mode === "signup" && (
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Must be at least 6 characters with letters &amp; numbers.
                </span>
              )}
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Admin invite (optional)
                </span>
                <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600">
                  <Shield size={15} className="text-gray-400" />
                  <input
                    className="w-full text-sm outline-none"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Leave blank for a normal account"
                    autoComplete="off"
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors shadow-xs"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
