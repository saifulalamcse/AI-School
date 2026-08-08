/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/prompt-library/")({
  head: () => ({
    meta: [
      { title: "Prompt Library — AI School" },
      {
        name: "description",
        content:
          "A curated, searchable library of battle-tested prompts for Midjourney, ChatGPT, Claude and more.",
      },
      { property: "og:title", content: "Prompt Library — AI School" },
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("prompts")
          .select("*")
          .neq("category", "AI News")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setPrompts(data.filter((p) => p.category !== "AI News"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = prompts.filter((p) => {
    if (p.category === "AI News") return false;
    const matchesCat = cat === "All" || p.category === cat;
    const query = q.toLowerCase().trim();
    const tagList = Array.isArray(p.tags) ? p.tags : [];
    const promptStr = typeof p.prompt === "string" ? p.prompt : "";
    const matchesSearch =
      query === "" ||
      (p.title && p.title.toLowerCase().includes(query)) ||
      tagList.some((t: string) => typeof t === "string" && t.toLowerCase().includes(query)) ||
      promptStr.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="pt-32 pb-24 bg-[#faf9f6]">
        <section className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-purple-600 font-bold mb-2">
              Copy. Paste. Get Results.
            </div>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-none text-neutral-900">
              <span className="gradient-text">Prompt</span> Library
            </h1>
          </div>

          <div className="mt-12 max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search prompts by title, tags..."
                className="w-full rounded-full pl-6 pr-12 py-3.5 bg-white border border-neutral-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 outline-none text-sm transition-all shadow-sm text-neutral-900 placeholder-neutral-400"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  cat === c
                    ? "gradient-bg text-white border-transparent shadow-md"
                    : "border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 bg-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid place-items-center py-32">
              <Loader2 className="size-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to="/prompt-library/$id"
                  params={{ id: p.id }}
                  className="bg-[#f2ebe1] border border-neutral-200/40 rounded-[24px] overflow-hidden group hover:-translate-y-1.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between p-4"
                >
                  <div className="flex-1 flex flex-col justify-between mb-4">
                    <div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(p.tags || []).slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] bg-white/80 border border-neutral-200/30 text-neutral-600 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-display font-semibold text-base leading-snug text-neutral-900 group-hover:text-purple-600 transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  <div className="h-60 relative bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full gradient-bg opacity-10" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="mt-20 text-center text-neutral-500 text-sm">
              No prompts match your search criteria.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
