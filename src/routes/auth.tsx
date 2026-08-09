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
      { title: "Login or Sign Up — AI School" },
      {
        name: "description",
        content:
          "Sign in to your AI School account to access your dashboard, courses and saved prompts.",
      },
      { property: "og:title", content: "Login or Sign Up — AI School" },
      {
        property: "og:description",
        content: "Access your AI School dashboard, courses and saved prompts.",
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
      if (fullName.trim().length < 4) {
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
      toast.success("Account created! Welcome to AI School.");
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
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirect ?? "/dashboard"}`,
        },
      });
      if (error) {
        setGoogleLoading(false);
        toast.error(error.message || "Google sign-in failed. Please try again.");
      }
    } catch (err: unknown) {
      setGoogleLoading(false);
      const msg = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      toast.error(msg);
    }
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
                  className="btn-outline-pill w-full inline-flex items-center justify-center gap-2.5 disabled:opacity-60 hover:border-white/40 transition"
                >
                  {googleLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
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
