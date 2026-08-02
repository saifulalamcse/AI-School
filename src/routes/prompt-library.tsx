/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Check, Copy, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
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

const CATEGORIES = ["All", "AI Productivity", "AI Tools", "Design", "Image Generation"] as const;

function PromptLibraryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPrompts(data);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = prompts.filter((p) => {
    const matchesCat = cat === "All" || p.category === cat;
    const matchesSearch =
      q === "" ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.tags.some((t: string) => t.toLowerCase().includes(q.toLowerCase())) ||
      p.prompt.toLowerCase().includes(q.toLowerCase());
    return matchesCat && matchesSearch;
  });

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlockId(id);
      toast.success("Prompt copied to clipboard.");
      setTimeout(() => setCopiedBlockId((c) => (c === id ? null : c)), 2000);
    } catch {
      toast.error("Couldn't copy text automatically.");
    }
  }

  async function save(p: any) {
    if (!user) {
      toast.info("Sign in to save prompts.");
      navigate({
        to: "/auth",
        search: { mode: "login" as const, redirect: "/prompt-library" },
      });
      return;
    }
    setSaving(p.id);
    const { error } = await supabase.from("saved_prompts").upsert(
      {
        user_id: user.id,
        prompt_title: p.title,
        category: p.category,
        tool: p.category, // using category as tool fallback
      },
      { onConflict: "user_id,prompt_title" },
    );
    setSaving(null);
    if (error) return toast.error("Could not save this prompt.");
    toast.success("Saved to your dashboard.");
  }

  // Parse prompt payload
  function parsePromptData(promptStr: string) {
    try {
      return JSON.parse(promptStr);
    } catch {
      return { intro: promptStr, blocks: [] };
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-5">
          {/* Headline exactly matching reference */}
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-2">
              Copy. Paste. Get Results.
            </div>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-none">
              <span className="gradient-text">Prompt</span> Library
            </h1>
          </div>

          {/* Search bar matching SS style */}
          <div className="mt-12 max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search prompts by title, tags..."
                className="w-full rounded-full pl-6 pr-12 py-3.5 bg-card border border-border focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 outline-none text-sm transition-all shadow-inner"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  cat === c
                    ? "gradient-bg text-white border-transparent shadow-md"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {c === "All" ? "All" : c}
              </button>
            ))}
          </div>

          {/* Grid of Prompt Cards */}
          {loading ? (
            <div className="grid place-items-center py-32">
              <Loader2 className="size-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrompt(p)}
                  className="surface-card overflow-hidden group cursor-pointer hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Tags inline at the top of the card */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {(p.tags || []).slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] bg-white/5 border border-border text-muted-foreground px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-purple-400 transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  {/* Collage style cover image */}
                  <div className="h-60 relative bg-purple-950/20 overflow-hidden shrink-0">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full gradient-bg opacity-30" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="mt-20 text-center text-muted-foreground text-sm">
              No prompts match your search criteria.
            </div>
          )}
        </section>
      </main>

      {/* OVERLAY / DETAILED MODAL SCREEN */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPrompt(null)}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition border border-white/10"
              title="Close"
            >
              <X className="size-5" />
            </button>

            {/* Collage Banner Header */}
            <div className="relative h-64 md:h-80 bg-purple-950/30 overflow-hidden flex items-center justify-center">
              {selectedPrompt.image_url ? (
                <img
                  src={selectedPrompt.image_url}
                  alt=""
                  className="w-full h-full object-cover blur-sm opacity-20 absolute inset-0"
                />
              ) : null}

              {/* Render banner gallery showing up to 4 block images */}
              <div className="relative z-10 w-full h-full px-8 py-6 flex items-center justify-center gap-4 overflow-x-auto">
                {parsePromptData(selectedPrompt.prompt)
                  .blocks?.slice(0, 3)
                  .map((block: any, i: number) =>
                    block.imageUrl ? (
                      <div
                        key={i}
                        className="h-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0"
                      >
                        <img src={block.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : null,
                  ) ||
                  (selectedPrompt.image_url && (
                    <div className="h-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
                      <img
                        src={selectedPrompt.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {/* Title */}
                <h2 className="font-display font-bold text-2xl md:text-3xl leading-snug text-white">
                  {selectedPrompt.title}
                </h2>

                {/* Category & Tags List */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                    {selectedPrompt.category}
                  </span>
                  {(selectedPrompt.tags || []).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/5 border border-border text-muted-foreground px-2.5 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {parsePromptData(selectedPrompt.prompt).intro}
              </p>

              {/* Action Banner: Save Prompt */}
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-border">
                <span className="text-xs text-muted-foreground">
                  Keep this prompt workflow for later
                </span>
                <button
                  onClick={() => save(selectedPrompt)}
                  disabled={saving === selectedPrompt.id}
                  className="btn-outline-pill text-xs py-1.5 px-4 inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Bookmark className="size-3.5" /> Save to Dashboard
                </button>
              </div>

              {/* Steps / Blocks Section */}
              <div className="space-y-8 pt-4 border-t border-border">
                <h3 className="font-display font-bold text-lg text-white">Prompt Blocks</h3>
                <div className="space-y-6">
                  {parsePromptData(selectedPrompt.prompt).blocks?.map((block: any, i: number) => {
                    const blockId = `${selectedPrompt.id}-block-${i}`;
                    return (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                            {block.tool} Prompt
                          </span>
                        </div>

                        {/* Copyable Code Box */}
                        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
                          <div className="p-4 pr-16 font-mono text-xs md:text-sm text-foreground overflow-x-auto whitespace-pre-wrap">
                            {block.promptText}
                          </div>
                          <button
                            onClick={() => copyText(block.promptText, blockId)}
                            className="absolute right-3 top-3 p-2 rounded-xl bg-background border border-border hover:text-foreground text-muted-foreground transition"
                            title="Copy Prompt"
                          >
                            {copiedBlockId === blockId ? (
                              <Check className="size-4 text-green-400" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </div>

                        {/* Result Output Image */}
                        {block.imageUrl && (
                          <div className="rounded-2xl overflow-hidden border border-border aspect-[16/10] bg-purple-950/10">
                            <img
                              src={block.imageUrl}
                              alt={`Step ${i + 1} Output`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedPrompt(null)}
                className="btn-outline-pill text-xs py-2 px-5"
              >
                Close Library Details
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
