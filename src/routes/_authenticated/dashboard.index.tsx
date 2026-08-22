import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Bookmark, Camera, Loader2, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchCourses, type DynamicCourse } from "@/lib/site-api";
import { useAuth } from "@/lib/auth";

type Enrollment = {
  id: string;
  course_slug: string;
  course_title: string;
  plan: string;
  status: string;
  created_at: string;
  thumbnail_url?: string | null;
  total_lessons?: number;
  completed_lessons?: number;
  progress_percent?: number;
};

type SavedPrompt = {
  id: string;
  prompt_title: string;
  category: string | null;
  tool: string | null;
  prompt_id?: string | null;
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
      { title: "Your Dashboard — AI School" },
      {
        name: "description",
        content:
          "Your AI School dashboard: enrolled courses, saved prompts, profile and account settings.",
      },
      { property: "og:title", content: "Your Dashboard — AI School" },
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
      const [
        { data: e },
        { data: s },
        allCourses,
        { data: allPrompts },
        { data: allSections },
        { data: allProgress },
      ] = await Promise.all([
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
        fetchCourses().catch(() => []),
        supabase
          .from("prompts")
          .select("id, title")
          .neq("category", "AI News")
          .then((res) => ({ data: res.data || [] }))
          .catch(() => ({ data: [] })),
        supabase.from("sections").select("id, course_slug, lessons(id)"),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
      ]);
      if (!active) return;

      const courseMap = new Map((allCourses || []).map((c) => [c.slug, c]));
      const promptMap = new Map(
        ((allPrompts as { id: string; title: string }[]) || []).map((p) => [
          p.title.toLowerCase().trim(),
          p.id,
        ]),
      );
      const completedSet = new Set((allProgress || []).map((p) => p.lesson_id));

      type SectionItem = { id: string; course_slug: string; lessons: { id: string }[] };
      const typedSections = (allSections as unknown as SectionItem[]) || [];

      const enrichedEnrollments = ((e as Enrollment[]) ?? []).map((en) => {
        const matched = courseMap.get(en.course_slug);

        // Find lessons for this course
        const courseSecs = typedSections.filter((sec) => sec.course_slug === en.course_slug);
        const courseLessons: { id: string }[] = courseSecs.flatMap((sec) => sec.lessons || []);
        const total = courseLessons.length;
        const done = courseLessons.filter((l) => completedSet.has(l.id)).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
          ...en,
          course_title: en.course_title || matched?.title || "AI Course",
          thumbnail_url: matched?.thumbnail_url || null,
          total_lessons: total,
          completed_lessons: done,
          progress_percent: percent,
        };
      });

      const enrichedSaved = ((s as SavedPrompt[]) ?? []).map((sp) => {
        return {
          ...sp,
          prompt_id: promptMap.get(sp.prompt_title.toLowerCase().trim()) || null,
        };
      });

      setEnrollments(enrichedEnrollments);
      setSaved(enrichedSaved);
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
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {enrollments.map((e) => (
        <div
          key={e.id}
          className="surface-card p-0 overflow-hidden rounded-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-border group shadow-lg"
        >
          <div>
            <div className="h-44 w-full relative bg-neutral-900 overflow-hidden">
              {e.thumbnail_url ? (
                <img
                  src={e.thumbnail_url}
                  alt={e.course_title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full gradient-bg opacity-80 flex items-center justify-center">
                  <BookOpen className="size-10 text-white/50" />
                </div>
              )}
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-purple-300 border border-white/10">
                {e.plan || "Course"} · {e.status || "Active"}
              </span>
            </div>

            <div className="p-6">
              <h3 className="font-display font-bold text-lg leading-snug line-clamp-2">
                {e.course_title}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {e.plan} · {e.status}
              </p>

              <div className="mt-4 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full gradient-bg transition-all duration-500"
                  style={{ width: `${e.progress_percent || 0}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {e.progress_percent === 0
                    ? "Start learning"
                    : e.progress_percent === 100
                      ? "Completed 🎉"
                      : "In progress"}
                </span>
                <span className="font-mono text-[10px] font-semibold text-foreground">
                  {e.progress_percent || 0}% completed ({e.completed_lessons || 0}/
                  {e.total_lessons || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Link
              to="/dashboard/courses/$slug"
              params={{ slug: e.course_slug }}
              className="btn-gradient w-full py-2.5 text-xs text-center block rounded-xl font-semibold"
            >
              {e.progress_percent === 0
                ? "Start learning →"
                : e.progress_percent === 100
                  ? "Review course →"
                  : "Continue learning →"}
            </Link>
          </div>
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
          {p.prompt_id ? (
            <Link
              to="/prompt-library/$id"
              params={{ id: p.prompt_id }}
              className="mt-2 font-display font-semibold hover:text-purple-400 transition block text-left hover:underline cursor-pointer"
            >
              {p.prompt_title}
            </Link>
          ) : (
            <h3 className="mt-2 font-display font-semibold text-muted-foreground">
              {p.prompt_title}
            </h3>
          )}
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
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setBio(profile?.bio ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${user.id}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from("course-assets")
        .upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("course-assets").getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      // Save immediately to profile
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        avatar_url: publicUrl,
      });
      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    if (error) return toast.error("Could not save your profile.");
    await onSaved();
    toast.success("Profile updated.");
  }

  const initials = (profile?.full_name || user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <form onSubmit={save} className="surface-card p-6 max-w-xl space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="size-20 rounded-full gradient-bg grid place-items-center text-white font-bold text-2xl overflow-hidden ring-2 ring-border">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || "avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials || "?"}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 size-7 rounded-full bg-purple-500 hover:bg-purple-400 transition grid place-items-center text-white shadow-lg"
            title="Change photo"
          >
            {uploadingAvatar ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Camera className="size-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <p className="font-semibold text-sm">{fullName || "Your Name"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition font-medium"
          >
            {uploadingAvatar ? "Uploading..." : "Change profile photo"}
          </button>
        </div>
      </div>

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
