import { useState, useRef, useEffect } from "react";
import {
  GoogleAuthProvider, signInWithPopup,
  RecaptchaVerifier, signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { Droplets, Phone, ArrowRight, ShieldCheck, Loader2, ChevronLeft } from "lucide-react";

// ── Google Sign-In ────────────────────────────────────────────────────────────
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export default function LoginPage() {
  const [tab,          setTab]          = useState("google");   // "google" | "phone"
  const [phone,        setPhone]        = useState("+91 ");
  const [otp,          setOtp]          = useState("");
  const [step,         setStep]         = useState("input");    // "input" | "otp"
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [confirmResult, setConfirmResult] = useState(null);

  const recaptchaRef = useRef(null);
  const recaptchaVerifier = useRef(null);

  // Setup invisible reCAPTCHA when phone tab is active
  useEffect(() => {
    if (tab !== "phone" || recaptchaVerifier.current) return;
    recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
    });
  }, [tab]);

  // ── Google handler ─────────────────────────────────────────────────────────
  async function handleGoogle() {
    setLoading(true); setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message.includes("popup-closed") ? "Sign-in popup was closed." : "Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Send OTP ───────────────────────────────────────────────────────────────
  async function handleSendOTP() {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.length < 10) { setError("Please enter a valid phone number."); return; }
    setLoading(true); setError("");
    try {
      const result = await signInWithPhoneNumber(auth, cleaned, recaptchaVerifier.current);
      setConfirmResult(result);
      setStep("otp");
    } catch (err) {
      console.error("[Login] OTP send error:", err);
      setError("Could not send OTP. Make sure phone auth is enabled in Firebase and the number is valid.");
      recaptchaVerifier.current = null; // reset reCAPTCHA on error
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  async function handleVerifyOTP() {
    if (otp.length < 6) { setError("Enter the 6-digit OTP."); return; }
    setLoading(true); setError("");
    try {
      await confirmResult.confirm(otp);
    } catch (err) {
      console.error("[Login] OTP verify error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* invisible recaptcha container */}
      <div id="recaptcha-container" ref={recaptchaRef} />

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="bg-green-700 px-8 py-8 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Droplets size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">JalLoop</h1>
          <p className="text-green-200 text-sm mt-1">Smart Water Recycling System</p>
        </div>

        <div className="px-8 py-7">
          <p className="text-center text-sm text-gray-500 mb-6">Sign in to access your dashboard</p>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setTab("google"); setError(""); setStep("input"); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "google" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
            >
              Google
            </button>
            <button
              onClick={() => { setTab("phone"); setError(""); setStep("input"); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "phone" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
            >
              Mobile OTP
            </button>
          </div>

          {/* ── Google Tab ── */}
          {tab === "google" && (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all font-semibold text-gray-700 text-sm disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-gray-400" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Signing in…" : "Continue with Google"}
            </button>
          )}

          {/* ── Phone Tab ── */}
          {tab === "phone" && step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Include country code, e.g. +91 for India</p>
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </div>
          )}

          {tab === "phone" && step === "otp" && (
            <div className="space-y-4">
              <button onClick={() => setStep("input")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-2">
                <ChevronLeft size={14} /> Change number
              </button>
              <div className="text-center bg-green-50 border border-green-200 rounded-xl py-3 px-4 mb-2">
                <ShieldCheck size={18} className="text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-700 font-medium">OTP sent to <span className="font-bold">{phone}</span></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Enter 6-digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to use JalLoop for water recycling monitoring only.
          </p>
        </div>
      </div>
    </div>
  );
}
