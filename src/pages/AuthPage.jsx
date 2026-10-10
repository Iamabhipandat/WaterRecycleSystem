import { useState } from "react";
import { Check, Copy, Droplets, KeyRound, Lock, Mail, Shield, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function mapAuthError(err) {
  const code = err?.code || "";
  if (code === "ACCOUNT_NOT_VERIFIED") {
    return "Account not verified. Please verify your account with your JWT token before logging in.";
  }
  if (code.includes("email-already-in-use")) return "That email already has an account. Log in or verify instead.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email or password is incorrect.";
  }
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a moment and try again.";
  return err?.message || "Something went wrong. Try again.";
}

export default function AuthPage() {
  const { login, signup, verifyAccount, resendVerificationToken } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCopyToken() {
    if (!tokenInput && !generatedToken) return;
    try {
      await navigator.clipboard.writeText(tokenInput || generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write error
    }
  }

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
          setGeneratedToken(res.verificationToken);
          setTokenInput(res.verificationToken);
          setUnverifiedEmail(res.email);
          setSuccessMsg("Account created! A signed JWT verification token has been issued. Click 'Verify Account' below to activate your account.");
          setMode("verify");
        }
      } else if (mode === "verify") {
        if (!tokenInput.trim()) throw new Error("Please enter or paste your JWT verification token.");
        const res = await verifyAccount(tokenInput);
        setSuccessMsg(res?.message || "Account verified successfully! Please enter your password to log in.");
        setPassword("");
        setMode("login");
      } else {
        await login({ email, password });
      }
    } catch (err) {
      if (err?.code === "ACCOUNT_NOT_VERIFIED") {
        setUnverifiedEmail(err.email || email);
        if (err.verificationToken) {
          setGeneratedToken(err.verificationToken);
          setTokenInput(err.verificationToken);
        }
      }
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccessMsg("");
    setBusy(true);
    try {
      const targetEmail = unverifiedEmail || email;
      if (!targetEmail) throw new Error("Please enter your registered email address.");
      const tok = await resendVerificationToken(targetEmail);
      setGeneratedToken(tok);
      setTokenInput(tok);
      setSuccessMsg("New JWT verification token generated successfully!");
    } catch (err) {
      setError(err?.message || "Failed to generate new verification token.");
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
          <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); setSuccessMsg(""); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => { setMode("verify"); setError(""); setSuccessMsg(""); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                mode === "verify" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Verify Token
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Check size={14} className="text-emerald-600" />
                Notification
              </p>
              <p>{successMsg}</p>
            </div>
          )}

          {/* Error Banner with Verification Action */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 space-y-2">
              <p className="font-semibold text-red-900">Authentication Error</p>
              <p>{error}</p>
              {error.includes("Account not verified") && mode !== "verify" && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("verify");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-700 underline hover:text-red-900"
                >
                  Enter Verification Token Now <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</span>
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

            {mode !== "verify" && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
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
            )}

            {mode !== "verify" && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</span>
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
                    Must be at least 6 characters with letters & numbers.
                  </span>
                )}
              </label>
            )}

            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin invite (optional)</span>
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

            {/* VERIFY MODE FIELDS */}
            {mode === "verify" && (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered Email</span>
                  <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600">
                    <Mail size={15} className="text-gray-400" />
                    <input
                      className="w-full text-sm outline-none"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </label>

                {/* JWT Verification Token Display Box */}
                {(generatedToken || tokenInput) && (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1">
                        <KeyRound size={13} className="text-sky-600" />
                        Signed Account JWT Token
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-100 hover:bg-sky-200 px-2 py-0.5 rounded-md transition-colors"
                      >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[10px] text-sky-800 break-all font-mono bg-white/70 p-2 rounded border border-sky-100 max-h-20 overflow-y-auto">
                      {generatedToken || tokenInput}
                    </p>
                    <p className="text-[10px] text-sky-600">
                      RFC 7519 HMAC-SHA256 Token with purpose: account_verification (valid 24h).
                    </p>
                  </div>
                )}

                <label className="block">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Paste JWT Verification Token
                  </span>
                  <div className="mt-1 border border-gray-200 rounded-xl p-2.5 focus-within:border-green-600 bg-white">
                    <textarea
                      rows={3}
                      className="w-full text-xs font-mono outline-none resize-none break-all"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      required
                    />
                  </div>
                </label>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={busy || !email}
                    className="text-green-700 hover:text-green-900 font-semibold disabled:opacity-50"
                  >
                    Resend / Reissue Token
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Back to Log in
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors shadow-xs"
            >
              {busy
                ? "Please wait…"
                : mode === "signup"
                ? "Create Account & Generate Token"
                : mode === "verify"
                ? "Verify Account & Enable Login"
                : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
