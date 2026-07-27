import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "signup" ? ("signup" as const) : ("login" as const),
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login or Sign Up — My Course" },
      {
        name: "description",
        content:
          "Sign in to your My Course account to access your dashboard, courses and saved prompts.",
      },
      { property: "og:title", content: "Login or Sign Up — My Course" },
      {
        property: "og:description",
        content: "Access your My Course dashboard, courses and saved prompts.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<Mode>(mode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  useEffect(() => setTab(mode), [mode]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: redirect ?? "/dashboard", replace: true });
    }
  }, [authLoading, user, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (forgot) {
      if (!email.trim()) return toast.error("Enter your email first.");
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Password reset link sent. Check your email.");
      setForgot(false);
      return;
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setLoading(true);
    if (tab === "signup") {
      if (fullName.trim().length < 2) {
        setLoading(false);
        return toast.error("Please enter your full name.");
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: fullName.trim() },
        },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      if (!data.session) {
        toast.success("Account created! Check your email to confirm, then log in.");
        navigate({ to: "/auth", search: { mode: "login" as const, redirect } });
        return;
      }
      toast.success("Account created! Welcome to My Course.");
      navigate({ to: redirect ?? "/dashboard" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      if (!remember) sessionStorage.setItem("av-session-only", "1");
      toast.success("Welcome back!");
      navigate({ to: redirect ?? "/dashboard" });
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: redirect ?? "/dashboard" });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-md px-5">
          <div className="text-center">
            <div className="eyebrow">✦ Members</div>
            <h1 className="mt-5 font-display font-bold text-4xl md:text-5xl">
              {forgot ? (
                <>
                  Reset <span className="gradient-text">password</span>
                </>
              ) : tab === "login" ? (
                <>
                  Welcome <span className="gradient-text">back</span>
                </>
              ) : (
                <>
                  Create your <span className="gradient-text">account</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {forgot
                ? "We'll email you a secure link to set a new password."
                : "Access your dashboard, courses and saved prompts."}
            </p>
          </div>

          {!forgot && (
            <div className="mt-8 grid grid-cols-2 p-1 rounded-full border border-border bg-card">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => navigate({ to: "/auth", search: { mode: m, redirect } })}
                  className={`py-2.5 rounded-full text-sm font-medium transition-all ${
                    tab === m
                      ? "gradient-bg text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 surface-card p-6 space-y-4">
            {tab === "signup" && !forgot && (
              <Field
                label="Full name"
                value={fullName}
                onChange={setFullName}
                type="text"
                placeholder="Your name"
                maxLength={100}
              />
            )}
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
              maxLength={255}
            />
            {!forgot && (
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                placeholder="••••••••"
                maxLength={72}
              />
            )}

            {!forgot && tab === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgot(true)}
                  className="gradient-text font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {forgot ? "Send reset link" : tab === "login" ? "Login" : "Create account"}
            </button>

            {forgot ? (
              <button
                type="button"
                onClick={() => setForgot(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition"
              >
                ← Back to login
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> or{" "}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="btn-outline-pill w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {googleLoading && <Loader2 className="size-4 animate-spin" />}
                  Continue with Google
                </button>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms.{" "}
            <Link to="/about" className="hover:text-foreground transition">
              Learn more
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        required
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
      />
    </label>
  );
}
