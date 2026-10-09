import { useState } from "react";
import { Droplets, Lock, Mail, User, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email already has an account. Log in instead.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email or password is incorrect.";
  }
  if (code.includes("too-many-requests")) return "Too many attempts. Wait a moment and try again.";
  return err?.message || "Something went wrong. Try again.";
}

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name.");
        await signup({ name, email, password, inviteCode });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center shadow-sm">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">JalLoop</h1>
            <p className="text-xs text-gray-500 font-medium">Smart Water Recycling</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`py-2 text-sm font-semibold rounded-lg transition-colors ${
                mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Sign up
            </button>
          </div>

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
                  />
                </div>
              </label>
            )}

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

            <label className="block">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</span>
              <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-600">
                <Lock size={15} className="text-gray-400" />
                <input
                  className="w-full text-sm outline-none"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
              </div>
            </label>

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

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
