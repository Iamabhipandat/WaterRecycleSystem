import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { onValue, ref, set, update } from "firebase/database";
import { supabase, isSupabaseReady } from "../services/supabase";
import { db, isFirebaseReady } from "../services/firebase";
import { ADMIN_EMAILS, ADMIN_INVITE_CODE } from "../config/appConfig";

const AuthContext = createContext(null);

/** Helper: Validate email format */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email || "").trim().toLowerCase());
}

/** Helper: Password strength check */
export function checkPasswordStrength(password) {
  if (!password || password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long." };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9!@#$%^&*()]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: "Password must contain both letters and numbers/symbols." };
  }
  return { valid: true, message: "Strong password." };
}

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Supabase Auth State Listener ──────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return undefined;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Firebase Realtime DB: Presence & profile sync (kept for IoT) ──────────
  useEffect(() => {
    if (!user || !db || !isFirebaseReady) return undefined;

    const uid = user.id;
    const email = user.email || "";
    const displayName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      email.split("@")[0] ||
      "User";

    const userRef = ref(db, `users/${uid}`);
    const unsub = onValue(
      userRef,
      (snap) => {
        const data = snap.val();
        if (!data) {
          // First time — seed the profile in Firebase RTDB
          set(userRef, {
            name: displayName,
            email: email.toLowerCase(),
            role: isAdminEmail(email) ? "admin" : "user",
            createdAt: Date.now(),
            lastSeen: Date.now(),
            online: true,
          });
          return;
        }
        const shouldBeAdmin = isAdminEmail(email) || data.role === "admin";
        setProfile({ ...data, role: shouldBeAdmin ? "admin" : "user" });
      },
      () => {
        // Firebase offline — use Supabase metadata as fallback
        setProfile({
          name: displayName,
          email: email.toLowerCase(),
          role: isAdminEmail(email) ? "admin" : "user",
        });
      },
    );

    return () => unsub();
  }, [user]);

  // ── Signup (Email + Password) ─────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password, inviteCode }) => {
    const trimmedEmail = String(email || "").trim().toLowerCase();

    if (!name || !name.trim()) {
      throw new Error("Please enter your full name.");
    }
    if (!validateEmail(trimmedEmail)) {
      throw new Error("Invalid email format. Please enter a valid email address.");
    }
    const pwdCheck = checkPasswordStrength(password);
    if (!pwdCheck.valid) throw new Error(pwdCheck.message);

    const role =
      isAdminEmail(trimmedEmail) || String(inviteCode || "").trim() === ADMIN_INVITE_CODE
        ? "admin"
        : "user";

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { name: name.trim(), role },
      },
    });

    if (error) {
      if (error.message?.includes("already registered")) {
        throw new Error("User already exists with this email address. Please log in.");
      }
      throw error;
    }

    // Supabase returns user but no session when email confirmation is required
    if (data.user && !data.session) {
      return {
        requireVerification: true,
        email: trimmedEmail,
        message: "Account created! Check your email for a verification link.",
      };
    }
  }, []);

  // ── Login (Email + Password) ──────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const trimmedEmail = String(email || "").trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) throw new Error("Invalid email format.");
    if (!password) throw new Error("Please enter your password.");

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      if (error.message?.includes("Invalid login")) {
        throw new Error("Invalid email or password. Please try again.");
      }
      if (error.message?.includes("Email not confirmed")) {
        throw new Error("Email not verified. Please check your inbox for the verification link.");
      }
      throw error;
    }
  }, []);

  // ── Login with Google OAuth ───────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }, []);

  // ── Login with Phone OTP ──────────────────────────────────────────────────
  const loginWithPhone = useCallback(async (phone) => {
    const cleaned = String(phone || "").replace(/\s/g, "");
    if (cleaned.length < 10) throw new Error("Please enter a valid phone number.");

    const { error } = await supabase.auth.signInWithOtp({ phone: cleaned });
    if (error) throw error;
  }, []);

  // ── Verify Phone OTP ─────────────────────────────────────────────────────
  const verifyPhoneOtp = useCallback(async (phone, token) => {
    const cleaned = String(phone || "").replace(/\s/g, "");

    const { error } = await supabase.auth.verifyOtp({
      phone: cleaned,
      token,
      type: "sms",
    });
    if (error) throw error;
  }, []);

  // ── Resend verification email ─────────────────────────────────────────────
  const resendVerificationEmail = useCallback(async (email) => {
    const trimmed = String(email || "").trim().toLowerCase();
    if (!trimmed) throw new Error("Please enter your registered email address.");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
    });
    if (error) throw error;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    // Update Firebase RTDB presence before signing out
    if (user && db && isFirebaseReady) {
      try {
        await set(ref(db, `presence/${user.id}`), {
          online: false,
          lastSeen: Date.now(),
          email: user.email || "",
        });
        await update(ref(db, `users/${user.id}`), {
          online: false,
          lastSeen: Date.now(),
        });
      } catch {
        // Ignore offline errors
      }
    }
    await supabase.auth.signOut();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      token: session?.access_token ?? null,
      loading,
      isAuthenticated: Boolean(user && session),
      isAdmin: profile?.role === "admin" || isAdminEmail(user?.email),
      signup,
      login,
      loginWithGoogle,
      loginWithPhone,
      verifyPhoneOtp,
      resendVerificationEmail,
      logout,
    }),
    [user, profile, session, loading, signup, login, loginWithGoogle, loginWithPhone, verifyPhoneOtp, resendVerificationEmail, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
