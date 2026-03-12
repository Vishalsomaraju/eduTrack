import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null, // supabase user object
  profile: null, // { id, name, role, email, avatar_url }
  role: null, // 'admin' | 'faculty' | 'student'
  loading: true, // true until first session check resolves
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, role: profile?.role ?? null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ user: null, profile: null, role: null, loading: false, error: null }),
}));
