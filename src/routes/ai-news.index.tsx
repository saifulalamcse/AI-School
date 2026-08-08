/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchNewsArticles, type DynamicNewsArticle } from "@/lib/site-api";

export const Route = createFileRoute("/ai-news/")({
  head: () => ({
    meta: [
      { title: "AI News — AI School" },
      {
        name: "description",
        content:
          "Daily AI news, decoded in 3 minutes. The stories moving AI and what they mean for creators and businesses.",
      },
      { property: "og:title", content: "AI News — AI School" },
      {
        property: "og:description",
        content: "The stories moving AI — decoded in 3 minutes.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NewsCatalogPage,
});

const NEWS_TAGS = [
  "All",
  "AGI",
  "AI",
  "AI Tools",
  "AI News",
  "Business",
  "Case Studies",
  "Design",
  "Economics",
  "Entrepreneurship",
  "Health News",
  "Marketing",
  "Podcasts",
  "SEO",
  "Science News",
  "Social Media",
  "Tutorials",
  "YouTube",
  "ChatGPT",
  "Midjourney",
  "Runway",
  "Update",
] as const;

function NewsCatalogPage() {
  const [articles, setArticles] = useState<DynamicNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchNewsArticles();
        setArticles(data || []);
      } catch (err) {
        console.error("fetchNewsArticles error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = articles.filter((item) => {
    const tagList = Array.isArray(item.tags) ? item.tags : [item.tag || item.category || "AI News"];
    const matchesTag =
      selectedTag === "All" ||
      item.category === selectedTag ||
      item.tag === selectedTag ||
      tagList.some((t) => typeof t === "string" && t.toLowerCase() === selectedTag.toLowerCase());

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === "" ||
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.summary && item.summary.toLowerCase().includes(query)) ||
      tagList.some((t) => typeof t === "string" && t.toLowerCase().includes(query));

    return matchesTag && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col justify-between">
      <Header />

      <main className="pt-32 pb-24 flex-1">
        <section className="mx-auto max-w-7xl px-5">
          {/* Header Subtitle & Title matching AI Varsity */}
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-2">
              All changed daily: <span className="text-purple-600 font-bold">stay ahead</span> with
              what works now.
            </div>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight">
              <span className="gradient-text">AI News</span>
            </h1>
          </div>

          {/* Search bar matching screenshot */}
          <div className="mt-10 max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, tags..."
                className="w-full rounded-full pl-6 pr-12 py-3.5 bg-white border border-neutral-200 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 outline-none text-sm transition-all shadow-sm text-neutral-900 placeholder-neutral-400"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            </div>
          </div>

          {/* Category & Tag filter pills matching AI Varsity */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-5xl mx-auto">
            {NEWS_TAGS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    active
                      ? "gradient-bg text-white border-transparent shadow-md"
                      : "border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 bg-white"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* News Card Grid matching AI Varsity screenshot */}
          {loading ? (
            <div className="grid place-items-center py-32">
              <Loader2 className="size-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  to="/ai-news/$id"
                  params={{ id: item.id }}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-950 border border-neutral-200/50 shadow-md flex flex-col justify-end p-5 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer block"
                >
                  {/* Cover Image */}
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-900 to-purple-950/70" />
                  )}

                  {/* Gradient Overlay for high readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {/* Card Content Overlay */}
                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 inline-block">
                      {item.tag || item.category || "AI News"}
                    </span>
                    <h3 className="font-display font-bold text-base md:text-lg text-white leading-snug drop-shadow-md group-hover:text-purple-200 transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="mt-20 text-center text-neutral-500 text-sm">
              No articles found matching your filter criteria.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
