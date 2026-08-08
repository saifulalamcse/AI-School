import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!emailRe.test(value) || value.length > 255) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: value });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setEmail("");
    toast.success("You're subscribed! Check your inbox soon.");
  }

  return (
    <form className={compact ? "flex gap-2" : "flex gap-2"} onSubmit={onSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={255}
        placeholder="you@example.com"
        className="flex-1 min-w-0 rounded-full px-5 py-3 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:border-purple-500 outline-none text-sm transition-colors"
      />
      <button className="btn-gradient disabled:opacity-60" type="submit" disabled={loading}>
        {loading ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
