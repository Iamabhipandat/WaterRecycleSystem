import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { onValue, ref, set, update } from "firebase/database";
import { auth, db, isFirebaseReady } from "../services/firebase";
import { ADMIN_EMAILS, ADMIN_INVITE_CODE } from "../config/appConfig";
import { createAccountVerificationToken, createSessionToken, verifyJwtToken } from "../utils/jwt";

const AuthContext = createContext(null);
const TOKEN_KEY = "jalloop_auth_token";
const USERS_STORAGE_KEY = "jalloop_local_users";

/** Helper: Validate email format using regex */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email || "").trim().toLowerCase());
}

/** Helper: Password strength check (min 6 chars, at least 1 letter & 1 number/symbol) */
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

/** Helper: Web Crypto SHA-256 Hash for client-side password hashing */
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());
}

function resolveRole(email, inviteCode) {
  const code = String(inviteCode || "").trim();
  if (isAdminEmail(email) || code === ADMIN_INVITE_CODE) return "admin";
  return "user";
}

/** Retrieve local users from localStorage */
function getLocalUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save local user to localStorage */
function saveLocalUser(userObj) {
  const users = getLocalUsers();
  users.push(userObj);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/** Update existing local user in localStorage */
function updateLocalUser(userObj) {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.email === userObj.email || u.uid === userObj.uid);
  if (idx !== -1) {
    users[idx] = userObj;
  } else {
    users.push(userObj);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUserRaw = localStorage.getItem("jalloop_user_session");
    
    if (savedToken && savedUserRaw) {
      try {
        const parsedUser = JSON.parse(savedUserRaw);
        setUser(parsedUser);
        setProfile({
          name: parsedUser.displayName || parsedUser.name || "User",
          email: parsedUser.email,
          role: parsedUser.role || (isAdminEmail(parsedUser.email) ? "admin" : "user"),
        });
        setToken(savedToken);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("jalloop_user_session");
      }
    }

    if (!isFirebaseReady || !auth) {
      setLoading(false);
      return undefined;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const tok = `jwt_${firebaseUser.uid}_${Date.now()}`;
        setToken(tok);
        localStorage.setItem(TOKEN_KEY, tok);
      } else if (!savedToken) {
        setUser(null);
        setProfile(null);
        setToken(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Firebase Realtime DB presence & profile sync
  useEffect(() => {
    if (!user || !db || !isFirebaseReady) return undefined;

    const userRef = ref(db, `users/${user.uid}`);
    const unsub = onValue(
      userRef,
      (snap) => {
        const data = snap.val();
        if (!data) {
          set(userRef, {
            name: user.displayName || "User",
            email: String(user.email || "").toLowerCase(),
            role: isAdminEmail(user.email) ? "admin" : "user",
            createdAt: Date.now(),
            lastSeen: Date.now(),
            online: true,
          });
          return;
        }
        const shouldBeAdmin = isAdminEmail(user.email) || data.role === "admin";
        setProfile({ ...data, role: shouldBeAdmin ? "admin" : "user" });
      },
      () => {
        setProfile({
          name: user.displayName || "User",
          email: String(user.email || "").toLowerCase(),
          role: isAdminEmail(user.email) ? "admin" : "user",
        });
      }
    );

    return () => unsub();
  }, [user]);

  const signup = useCallback(async ({ name, email, password, inviteCode }) => {
    // 1. Input Validation (HTTP 400 Bad Request)
    const trimmedEmail = String(email || "").trim().toLowerCase();
    if (!name || !name.trim()) {
      const err = new Error("Please enter your full name.");
      err.status = 400;
      throw err;
    }
    if (!validateEmail(trimmedEmail)) {
      const err = new Error("Invalid email format. Please enter a valid email address.");
      err.status = 400;
      throw err;
    }
    const pwdCheck = checkPasswordStrength(password);
    if (!pwdCheck.valid) {
      const err = new Error(pwdCheck.message);
      err.status = 400;
      throw err;
    }

    // 2. Duplicate Check (HTTP 409 Conflict)
    const existingUsers = getLocalUsers();
    if (existingUsers.some(u => u.email === trimmedEmail)) {
      const err = new Error("User already exists with this email address. Please log in.");
      err.status = 409;
      throw err;
    }

    // 3. Try Firebase Signup if configured
    if (isFirebaseReady && auth && db) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: name.trim() });
        const role = resolveRole(trimmedEmail, inviteCode);
        await set(ref(db, `users/${cred.user.uid}`), {
          name: name.trim(),
          email: trimmedEmail,
          role,
          createdAt: Date.now(),
          lastSeen: Date.now(),
          online: true,
        });
        const tok = `jwt_${cred.user.uid}_${Date.now()}`;
        setToken(tok);
        localStorage.setItem(TOKEN_KEY, tok);
        return;
      } catch (fbErr) {
        if (fbErr.code === "auth/email-already-in-use") {
          const err = new Error("User already exists with this email address.");
          err.status = 409;
          throw err;
        }
      }
    }

    // 4. Secure Hash & Production User Registration with JWT Verification Required
    const hashedPassword = await hashPassword(password);
    const role = resolveRole(trimmedEmail, inviteCode);
    const newUser = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      displayName: name.trim(),
      email: trimmedEmail,
      hashedPassword,
      role,
      verified: false,
      createdAt: Date.now(),
    };

    // Generate RFC 7519 JWT verification token (valid 24h)
    const verificationToken = await createAccountVerificationToken(newUser);
    newUser.verificationToken = verificationToken;
    saveLocalUser(newUser);

    return {
      requireVerification: true,
      email: trimmedEmail,
      verificationToken,
    };
  }, []);

  /** Verify account using signed JWT verification token */
  const verifyAccount = useCallback(async (jwtToken) => {
    if (!jwtToken || typeof jwtToken !== "string" || !jwtToken.trim()) {
      const err = new Error("Please provide a valid verification token.");
      err.status = 400;
      throw err;
    }

    const payload = await verifyJwtToken(jwtToken.trim());
    if (payload.purpose !== "account_verification") {
      const err = new Error("Invalid token type. Expected account verification token.");
      err.status = 400;
      throw err;
    }

    const existingUsers = getLocalUsers();
    const userMatch = existingUsers.find(
      (u) => (payload.email && u.email === payload.email.toLowerCase()) || (payload.sub && u.uid === payload.sub)
    );

    if (!userMatch) {
      const err = new Error("Account not found for this verification token.");
      err.status = 404;
      throw err;
    }

    if (userMatch.verified) {
      return {
        success: true,
        message: "Account is already verified. You can proceed to log in.",
        email: userMatch.email,
      };
    }

    userMatch.verified = true;
    userMatch.verifiedAt = Date.now();
    updateLocalUser(userMatch);

    return {
      success: true,
      message: "Account verified successfully! You can now log in.",
      email: userMatch.email,
    };
  }, []);

  /** Resend / re-generate verification JWT token for unverified account */
  const resendVerificationToken = useCallback(async (email) => {
    const trimmed = String(email || "").trim().toLowerCase();
    if (!trimmed) {
      const err = new Error("Please enter your registered email address.");
      err.status = 400;
      throw err;
    }
    const existingUsers = getLocalUsers();
    const userMatch = existingUsers.find((u) => u.email === trimmed);
    if (!userMatch) {
      const err = new Error("Account not found with this email address.");
      err.status = 404;
      throw err;
    }
    if (userMatch.verified) {
      const err = new Error("This account is already verified. Please log in.");
      err.status = 400;
      throw err;
    }

    const verificationToken = await createAccountVerificationToken(userMatch);
    userMatch.verificationToken = verificationToken;
    updateLocalUser(userMatch);
    return verificationToken;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    // 1. Input Validation (HTTP 400 Bad Request)
    const trimmedEmail = String(email || "").trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      const err = new Error("Invalid email format.");
      err.status = 400;
      throw err;
    }
    if (!password) {
      const err = new Error("Please enter your password.");
      err.status = 400;
      throw err;
    }

    // 2. Try Firebase Login if configured
    if (isFirebaseReady && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const tok = await createSessionToken({
          uid: cred.user.uid,
          email: trimmedEmail,
          displayName: cred.user.displayName,
          role: isAdminEmail(trimmedEmail) ? "admin" : "user",
        });
        setToken(tok);
        localStorage.setItem(TOKEN_KEY, tok);
        return;
      } catch (fbErr) {
        if (fbErr.code === "auth/invalid-credential" || fbErr.code === "auth/wrong-password") {
          const err = new Error("Invalid email or password.");
          err.status = 401;
          throw err;
        }
        if (fbErr.code === "auth/user-not-found") {
          const err = new Error("Account not found. Please sign up first.");
          err.status = 404;
          throw err;
        }
      }
    }

    // 3. Local Authentication & Hash Verification
    const existingUsers = getLocalUsers();
    const userMatch = existingUsers.find(u => u.email === trimmedEmail);
    if (!userMatch) {
      const err = new Error("Account not found with this email. Please check your credentials or sign up.");
      err.status = 404;
      throw err;
    }

    const hashedInput = await hashPassword(password);
    if (userMatch.hashedPassword !== hashedInput) {
      const err = new Error("Invalid email or password. Please try again.");
      err.status = 401;
      throw err;
    }

    // 4. Verification Check: Reject unverified accounts
    if (userMatch.verified === false) {
      const err = new Error("Account not verified. Please verify your account using your JWT token before logging in.");
      err.status = 403;
      err.code = "ACCOUNT_NOT_VERIFIED";
      err.email = userMatch.email;
      err.verificationToken = userMatch.verificationToken;
      throw err;
    }

    // 5. Success login: Issue signed RFC 7519 JWT session token
    const sessionJwt = await createSessionToken(userMatch);
    setUser(userMatch);
    setProfile({ name: userMatch.displayName, email: userMatch.email, role: userMatch.role });
    setToken(sessionJwt);
    localStorage.setItem(TOKEN_KEY, sessionJwt);
    localStorage.setItem("jalloop_user_session", JSON.stringify(userMatch));
  }, []);

  const logout = useCallback(async () => {
    if (user && db && auth && isFirebaseReady) {
      try {
        await set(ref(db, `presence/${user.uid}`), {
          online: false,
          lastSeen: Date.now(),
          email: user.email || "",
        });
        await update(ref(db, `users/${user.uid}`), { online: false, lastSeen: Date.now() });
        await signOut(auth);
      } catch {
        // Ignore offline error
      }
    }
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("jalloop_user_session");
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: profile?.role === "admin",
      signup,
      verifyAccount,
      resendVerificationToken,
      login,
      logout,
    }),
    [user, profile, token, loading, signup, verifyAccount, resendVerificationToken, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
