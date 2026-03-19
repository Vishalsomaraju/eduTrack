import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button, Card, Input } from "@/components/ui";

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((chunk) => chunk?.[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getRoleBadgeVariant(role) {
  if (role === "admin") return "blue";
  if (role === "student") return "green";
  return "amber";
}

function formatMemberSince(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(profile?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(profile?.name ?? "");
  }, [profile?.name]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  const roleLabel = useMemo(() => {
    if (!profile?.role) return "User";
    return profile.role[0].toUpperCase() + profile.role.slice(1);
  }, [profile?.role]);

  async function handleSaveName() {
    const nextName = name.trim();
    if (!nextName || !user?.id) return;

    setSavingName(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name: nextName })
      .eq("id", user.id);

    setSavingName(false);

    if (updateError) {
      setError(updateError.message || "Unable to update name");
      return;
    }

    setProfile({ ...(profile ?? {}), name: nextName });
    setToast("Name updated");
  }

  async function handleSignOut() {
    setSigningOut(true);
    const { error: signOutError } = await signOut();
    setSigningOut(false);

    if (signOutError) {
      setError(signOutError.message || "Unable to sign out");
      return;
    }

    navigate("/login");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-0">
      <div className="mb-5 flex items-center gap-4 rounded-xl border border-(--border) bg-(--bg-surface) p-5">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile?.name ?? "User"}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-(--border) bg-(--accent-subtle) font-syne text-lg font-bold text-(--accent)">
            {getInitials(profile?.name ?? user?.email ?? "")}
          </div>
        )}

        <div className="min-w-0">
          <p className="mb-1 truncate font-syne text-3xl font-bold text-(--text-primary)">
            {profile?.name || "EduTrack User"}
          </p>
          <Badge variant={getRoleBadgeVariant(profile?.role)}>
            {roleLabel}
          </Badge>
        </div>
      </div>

      <div className="space-y-5">
        <Card title="Profile Information">
          <div className="space-y-3">
            <div className="rounded-lg border border-(--border) bg-(--bg-elevated) p-3">
              <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                Email
              </p>
              <p className="text-sm text-(--text-primary)">
                {user?.email || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-(--border) bg-(--bg-elevated) p-3">
              <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                Role
              </p>
              <p className="text-sm capitalize text-(--text-primary)">
                {profile?.role || "-"}
              </p>
            </div>
            <div className="rounded-lg border border-(--border) bg-(--bg-elevated) p-3">
              <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                Member Since
              </p>
              <p className="text-sm text-(--text-primary)">
                {formatMemberSince(profile?.created_at)}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Edit Name">
          <div className="space-y-3">
            <Input
              label="Display Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
            />
            <Button
              onClick={handleSaveName}
              loading={savingName}
              disabled={!name.trim() || name.trim() === (profile?.name ?? "")}
            >
              Save
            </Button>
          </div>
        </Card>

        <Card title="Appearance">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-(--text-muted)">
              Current theme: <span className="capitalize">{theme}</span>
            </p>
            <Button variant="secondary" onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </div>
        </Card>

        <Button
          variant="danger"
          fullWidth
          loading={signingOut}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>

        {error && (
          <p className="rounded-lg border border-(--accent-red-border) bg-(--accent-red-bg) px-3 py-2 text-sm text-(--accent-red)">
            {error}
          </p>
        )}
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-(--accent-green-border) bg-(--accent-green-bg) px-4 py-2 text-sm font-semibold text-(--accent-green) shadow-lg">
          <UserCircle size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
