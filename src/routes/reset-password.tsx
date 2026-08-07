import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — AI School" },
      {
        name: "description",
        content: "Choose a new password for your AI School account.",
      },
      { property: "og:title", content: "Set a New Password — AI School" },
      {
        property: "og:description",
        content: "Choose a new password for your AI School account.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-md px-5">
          <h1 className="font-display font-bold text-4xl text-center">
            New <span className="gradient-text">password</span>
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {ready
              ? "Enter a new password for your account."
              : "Open this page from the reset link in your email."}
          </p>
          <form onSubmit={onSubmit} className="mt-8 surface-card p-6 space-y-4">
            <input
              type="password"
              required
              value={password}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
            />
            <input
              type="password"
              required
              value={confirm}
              maxLength={72}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-xl px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !ready}
              className="btn-gradient w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Update password
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
