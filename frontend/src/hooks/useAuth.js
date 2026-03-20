import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import api, { apiWithToken } from "@/lib/api";

export function useAuth() {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
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
            setUser({
              user: session.user,
              profile,
              role: profile.role,
            });
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

      // Use token directly from signIn response
      // getSession() is not reliable immediately after login
      const token = data.session.access_token;

      try {
        const profile = await apiWithToken("/auth/me", token);
        setUser({
          user: data.user,
          profile,
          role: profile.role,
        });
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
    await supabase.auth.signOut();
    clearUser();
    setLoading(false);
  };

  return { signIn, signOut };
}
