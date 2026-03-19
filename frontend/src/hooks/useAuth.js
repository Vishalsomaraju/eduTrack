import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

export function useAuth() {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Step 1 — check existing session on mount
    const initAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          try {
            const profile = await api.get("/auth/me");
            setUser({
              user: session.user,
              profile,
              role: profile.role,
            });
          } catch (err) {
            // Token exists but /auth/me failed
            // Clear session to force re-login
            console.error("Profile fetch failed:", err);
            await supabase.auth.signOut();
            clearUser();
          }
        } else {
          // No session — just clear loading
          clearUser();
        }
      } catch (err) {
        console.error("Auth init failed:", err);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Step 2 — listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setLoading(true);
        try {
          const profile = await api.get("/auth/me");
          setUser({
            user: session.user,
            profile,
            role: profile.role,
          });
        } catch (err) {
          console.error("Profile fetch on sign in failed:", err);
          clearUser();
        } finally {
          setLoading(false);
        }
      }

      if (event === "SIGNED_OUT") {
        clearUser();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoading(false);
        return { error };
      }
      // onAuthStateChange handles the rest
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    clearUser();
    setLoading(false);
  };

  return { signIn, signOut };
}
