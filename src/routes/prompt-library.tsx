import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { prompts } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/prompt-library")({
  head: () => ({
    meta: [
      { title: "Prompt Library — My Course" },
      {
        name: "description",
        content:
          "A curated, searchable library of battle-tested prompts for Midjourney, ChatGPT, Claude and more.",
      },
      { property: "og:title", content: "Prompt Library — My Course" },
      {
        property: "og:description",
        content: "Copy-paste prompts that produce professional results in seconds.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PromptLibraryPage,
});

const CATEGORIES = ["All", "Image", "Video", "Website", "Copy"] as const;

function PromptLibraryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const filtered = prompts.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (q === "" ||
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.tool.toLowerCase().includes(q.toLowerCase()) ||
        p.text.toLowerCase().includes(q.toLowerCase())),
  );

  async function copy(title: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(title);
      toast.success("Prompt copied to clipboard.");
      setTimeout(() => setCopied((c) => (c === title ? null : c)), 2000);
    } catch {
      toast.error("Couldn't copy. Select the text manually.");
    }
  }

  async function save(p: (typeof prompts)[number]) {
    if (!user) {
      toast.info("Sign in to save prompts.");
      navigate({
        to: "/auth",
        search: { mode: "login" as const, redirect: "/prompt-library" },
      });
      return;
    }
    setSaving(p.title);
    const { error } = await supabase.from("saved_prompts").upsert(
      {
        user_id: user.id,
        prompt_title: p.title,
        category: p.category,
        tool: p.tool,
      },
      { onConflict: "user_id,prompt_title" },
    );
    setSaving(null);
    if (error) return toast.error("Could not save this prompt.");
    toast.success("Saved to your dashboard.");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <div className="eyebrow">✦ Free Resource</div>
            <h1 className="mt-5 font-display font-bold text-5xl md:text-7xl">
              <span className="gradient-text">Prompt</span> Library
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-muted-foreground">
              Browse, search and copy prompts that actually work — organized by tool and use case.
            </p>
          </div>

          <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search prompts…"
              className="w-full md:max-w-sm rounded-full px-5 py-3 bg-card border border-border focus:border-primary outline-none text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    cat === c
                      ? "gradient-bg text-white border-transparent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <div
                key={p.title}
                className="surface-card overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                <div
                  className="aspect-[4/5]"
                  style={{
                    background: `linear-gradient(${(i * 47) % 360}deg, #7c3aed, #ec4899, #f97316)`,
                  }}
                />
                <div className="p-5">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {p.category} · {p.tool}
                  </span>
                  <h3 className="mt-2 font-display font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{p.text}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => copy(p.title, p.text)}
                      className="text-sm gradient-text font-medium inline-flex items-center gap-1"
                    >
                      {copied === p.title ? (
                        <>
                          <Check className="size-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" /> Copy Prompt
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => save(p)}
                      disabled={saving === p.title}
                      className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      <Bookmark className="size-4" /> Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-16 text-center text-muted-foreground">
              No prompts match your search.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
