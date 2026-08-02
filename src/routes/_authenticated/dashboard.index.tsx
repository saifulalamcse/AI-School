import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Bookmark, Loader2, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";

type Enrollment = {
  id: string;
  course_slug: string;
  course_title: string;
  plan: string;
  status: string;
  created_at: string;
};

type SavedPrompt = {
  id: string;
  prompt_title: string;
  category: string | null;
  tool: string | null;
};

const tabs = [
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "prompts", label: "Saved Prompts", icon: Bookmark },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — My Course" },
      {
        name: "description",
        content:
          "Your My Course dashboard: enrolled courses, saved prompts, profile and account settings.",
      },
      { property: "og:title", content: "Your Dashboard — My Course" },
      {
        property: "og:description",
        content: "Enrolled courses, saved prompts and account settings.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("courses");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [saved, setSaved] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [{ data: e }, { data: s }] = await Promise.all([
        supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_prompts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setEnrollments((e as Enrollment[]) ?? []);
      setSaved((s as SavedPrompt[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const name = profile?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="eyebrow">✦ Dashboard</div>
              <h1 className="mt-4 font-display font-bold text-4xl md:text-5xl">
                Hi, <span className="gradient-text">{name}</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex gap-2">
              <Link to="/prompt-library" className="btn-outline-pill text-sm">
                Browse prompts
              </Link>
              <Link to="/courses" className="btn-gradient text-sm">
                All Courses
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm border inline-flex items-center gap-2 transition ${
                  tab === t.id
                    ? "gradient-bg text-white border-transparent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="grid place-items-center py-24 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : tab === "courses" ? (
              <CoursesTab enrollments={enrollments} />
            ) : tab === "prompts" ? (
              <PromptsTab
                saved={saved}
                onRemove={async (id) => {
                  await supabase.from("saved_prompts").delete().eq("id", id);
                  setSaved((p) => p.filter((x) => x.id !== id));
                  toast.success("Prompt removed.");
                }}
              />
            ) : tab === "profile" ? (
              <ProfileTab onSaved={refreshProfile} />
            ) : (
              <SettingsTab onSignOut={signOut} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CoursesTab({ enrollments }: { enrollments: Enrollment[] }) {
  if (enrollments.length === 0) {
    return (
      <EmptyState
        title="No courses enrolled yet"
        body="You haven't enrolled in any course yet. Browse our course catalog to get started."
        action={
          <Link to="/courses" className="btn-gradient">
            Browse All Courses →
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {enrollments.map((e) => (
        <div key={e.id} className="surface-card p-6 hover:-translate-y-1 transition flex flex-col">
          <div className="h-28 rounded-xl gradient-bg opacity-80" />
          <h3 className="mt-5 font-display font-semibold text-lg">{e.course_title}</h3>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {e.plan} · {e.status}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full gradient-bg" style={{ width: "0%" }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Start learning</p>
          <Link
            to="/dashboard/courses/$slug"
            params={{ slug: e.course_slug }}
            className="mt-5 inline-block text-sm gradient-text font-medium hover:underline"
          >
            Continue learning →
          </Link>
        </div>
      ))}
    </div>
  );
}

function PromptsTab({ saved, onRemove }: { saved: SavedPrompt[]; onRemove: (id: string) => void }) {
  if (saved.length === 0) {
    return (
      <EmptyState
        title="No saved prompts"
        body="Save prompts from the library and they'll show up here."
        action={
          <Link to="/prompt-library" className="btn-gradient">
            Open prompt library →
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map((p) => (
        <div key={p.id} className="surface-card p-5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {p.category} · {p.tool}
          </span>
          <h3 className="mt-2 font-display font-semibold">{p.prompt_title}</h3>
          <button
            onClick={() => onRemove(p.id)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (fullName.trim().length < 2) return toast.error("Enter your full name.");
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName.trim().slice(0, 100),
      bio: bio.trim().slice(0, 500),
    });
    setSaving(false);
    if (error) return toast.error("Could not save your profile.");
    await onSaved();
    toast.success("Profile updated.");
  }

  return (
    <form onSubmit={save} className="surface-card p-6 max-w-xl space-y-4">
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Full name</span>
        <input
          value={fullName}
          maxLength={100}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full rounded-xl px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Bio</span>
        <textarea
          value={bio}
          rows={4}
          maxLength={500}
          onChange={(e) => setBio(e.target.value)}
          className="mt-2 w-full rounded-xl px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm transition-colors resize-none"
        />
      </label>
      <button
        disabled={saving}
        className="btn-gradient inline-flex items-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </button>
    </form>
  );
}

function SettingsTab({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  async function sendReset() {
    if (!user?.email) return;
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent to your email.");
  }

  return (
    <div className="surface-card p-6 max-w-xl space-y-6">
      <div>
        <h3 className="font-display font-semibold">Password</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll email you a secure link to change your password.
        </p>
        <button
          onClick={sendReset}
          disabled={sending}
          className="mt-4 btn-outline-pill inline-flex items-center gap-2 disabled:opacity-60"
        >
          {sending && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </button>
      </div>
      <div className="border-t border-border pt-6">
        <h3 className="font-display font-semibold">Session</h3>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>
        <button onClick={onSignOut} className="mt-4 btn-gradient">
          Sign out
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="surface-card p-12 text-center">
      <h3 className="font-display font-semibold text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{body}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
