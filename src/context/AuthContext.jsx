import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { onDisconnect, onValue, ref, serverTimestamp, set, update } from "firebase/database";
import { auth, db, isFirebaseReady } from "../services/firebase";
import { ADMIN_EMAILS, ADMIN_INVITE_CODE } from "../config/appConfig";

const AuthContext = createContext(null);

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());
}

function resolveRole(email, inviteCode) {
  const code = String(inviteCode || "").trim();
  if (isAdminEmail(email) || code === ADMIN_INVITE_CODE) return "admin";
  return "user";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady || !auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user || !db) return undefined;

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
        setLoading(false);
      },
      () => {
        setProfile({
          name: user.displayName || "User",
          email: String(user.email || "").toLowerCase(),
          role: isAdminEmail(user.email) ? "admin" : "user",
        });
        setLoading(false);
      }
    );

    const presenceRef = ref(db, `presence/${user.uid}`);
    const connectedRef = ref(db, ".info/connected");
    const unsubConn = onValue(connectedRef, (snap) => {
      if (snap.val() !== true) return;
      onDisconnect(presenceRef).set({
        online: false,
        lastSeen: serverTimestamp(),
        email: user.email || "",
      });
      set(presenceRef, {
        online: true,
        lastSeen: serverTimestamp(),
        email: user.email || "",
        name: user.displayName || "",
      });
      update(userRef, { lastSeen: Date.now(), online: true });
    });

    return () => {
      unsub();
      unsubConn();
    };
  }, [user]);

  const signup = async ({ name, email, password, inviteCode }) => {
    if (!auth || !db) throw new Error("Firebase is not configured");
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    const role = resolveRole(email, inviteCode);
    await set(ref(db, `users/${cred.user.uid}`), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      online: true,
    });
  };

  const login = async ({ email, password }) => {
    if (!auth) throw new Error("Firebase is not configured");
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const logout = async () => {
    if (user && db) {
      await set(ref(db, `presence/${user.uid}`), {
        online: false,
        lastSeen: Date.now(),
        email: user.email || "",
      });
      await update(ref(db, `users/${user.uid}`), { online: false, lastSeen: Date.now() });
    }
    if (auth) await signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      signup,
      login,
      logout,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
