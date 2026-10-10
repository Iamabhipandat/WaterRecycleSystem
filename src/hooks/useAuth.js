import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export function useAuth() {
  const [user,    setUser]    = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(() => (!auth ? false : true));

  useEffect(() => {
    if (!auth) { return undefined; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => auth && signOut(auth);

  return { user, loading, logout };
}
