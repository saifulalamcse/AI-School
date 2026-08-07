import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { news } from "@/lib/site-data";

export const Route = createFileRoute("/ai-news")({
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
  component: NewsPage,
});

function NewsPage() {
  const [featured, ...rest] = news;
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <div className="eyebrow">✦ Updated Daily</div>
            <h1 className="mt-5 font-display font-bold text-5xl md:text-7xl">
              <span className="gradient-text">AI News</span>
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-muted-foreground">
              The stories moving AI, decoded fast so you can spend your time building.
            </p>
          </div>

          {featured && (
            <div className="mt-14 surface-card grid md:grid-cols-2 items-stretch overflow-hidden">
              <div
                className="min-h-64"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#ec4899,#f97316)",
                }}
              />
              <div className="p-10 flex flex-col justify-center">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Featured · {featured.tag}
                </span>
                <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-muted-foreground">
                  {open === featured.title
                    ? featured.summary
                    : "Read the full breakdown in under 3 minutes — what changed, why it matters, and how to use it today."}
                </p>
                <button
                  onClick={() => setOpen((o) => (o === featured.title ? null : featured.title))}
                  className="mt-6 btn-gradient self-start"
                >
                  {open === featured.title ? "Close ←" : "Read Story →"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((n, i) => (
              <article
                key={n.title}
                className="surface-card overflow-hidden hover:-translate-y-1 transition"
              >
                <div
                  className="aspect-[16/9]"
                  style={{
                    background: `linear-gradient(${(i * 60) % 360}deg,#7c3aed,#0a0a0f)`,
                  }}
                />
                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {n.tag}
                  </span>
                  <h3 className="mt-2 font-display font-semibold text-lg leading-snug">
                    {n.title}
                  </h3>
                  {open === n.title && (
                    <p className="mt-3 text-sm text-muted-foreground">{n.summary}</p>
                  )}
                  <button
                    onClick={() => setOpen((o) => (o === n.title ? null : n.title))}
                    className="mt-4 text-sm gradient-text font-medium"
                  >
                    {open === n.title ? "Close ←" : "Read →"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
