import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { apiWithToken, apiCache } from "@/lib/api";

export function useAuth({ initialize = false } = {}) {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!initialize) return;

    const initAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          try {
            const profile = await apiWithToken(
              "/auth/me",
              session.access_token,
            );
            setUser({ user: session.user, profile, role: profile.role });
          } catch (err) {
            console.error("Profile fetch failed:", err);
            await supabase.auth.signOut();
            clearUser();
          }
        } else {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        // Clear all cached API responses on sign out —
        // critical so next user doesn't see previous user's data
        apiCache.clear();
        clearUser();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialize]);

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

      const token = data.session.access_token;
      try {
        const profile = await apiWithToken("/auth/me", token);
        setUser({ user: data.user, profile, role: profile.role });
      } catch (err) {
        console.error("Profile fetch after login failed:", err);
        clearUser();
      } finally {
        setLoading(false);
      }
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    setLoading(true);
    apiCache.clear(); // wipe cache before signing out
    await supabase.auth.signOut();
    clearUser();
    setLoading(false);
  };

  return { signIn, signOut };
}
