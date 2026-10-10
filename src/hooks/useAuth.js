import { useState, useEffect } from "react";
import { supabase, isSupabaseReady } from "../services/supabase";

/**
 * Lightweight auth hook for components that only need user + loading state.
 * For full auth operations (signup, login, etc.), use useAuth() from AuthContext.
 */
export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(() => isSupabaseReady);

  useEffect(() => {
    if (!isSupabaseReady) return undefined;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = () => supabase.auth.signOut();

  return { user, loading, logout };
}
