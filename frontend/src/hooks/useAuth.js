import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role, email, avatar_url")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export function useAuth() {
  const { setUser, setProfile, setLoading, setError, reset } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      }
      setLoading(false);
    });

    // Subscribe to auth state changes for the entire app lifetime
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      } else {
        reset();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email, password) {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      return { error };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    reset();
    navigate("/login");
  }

  return { signIn, signOut };
}
