/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import heroSpace from "@/assets/hero-space.jpg";
import personaCreator from "@/assets/persona-creator.jpg";
import laptopMockup from "@/assets/laptop-mockup.jpg";
import cuteRobot from "@/assets/cute-robot.png";
import {
  GraduationCap,
  Rocket,
  Award,
  Megaphone,
  User,
  PenTool,
  Video,
  Loader2,
} from "lucide-react";
import { skillTracks, workshops } from "@/lib/site-data";
import {
  fetchExperts,
  fetchNewsArticles,
  type DynamicExpert,
  type DynamicNewsArticle,
} from "@/lib/site-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI School — Learn AI for Real Productivity" },
      {
        name: "description",
        content:
          "Cohort-based AI communities, a curated prompt library and daily AI news. Learn the tools that make you 10x more productive.",
      },
      { property: "og:title", content: "AI School — Learn AI for Real Productivity" },
      {
        property: "og:description",
        content:
          "Cohort-based AI communities, a curated prompt library and daily AI news. Learn the tools that make you 10x more productive.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  const [experts, setExperts] = useState<DynamicExpert[]>([]);
  const [newsList, setNewsList] = useState<DynamicNewsArticle[]>([]);

  useEffect(() => {
    fetchExperts()
      .then(setExperts)
      .catch(() => {});
    fetchNewsArticles()
      .then(setNewsList)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <PromptLibrary />
        <SlowWork />
        <NewsPreview newsList={newsList} />
        <LearningMaterials />
        <Testimonials experts={experts} />
        <Workshops />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-24 lg:py-40">
      {/* Space grid background effect */}
      <img
        src={heroSpace}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover opacity-30 select-none pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background" />

      {/* Futuristic glow elements */}
      <div className="absolute -left-40 top-1/4 size-[400px] rounded-full gradient-bg opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute right-0 bottom-1/4 size-[500px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Text and CTA */}
        <div className="flex flex-col text-left lg:w-1/2 space-y-6 z-10">
          <h1 className="font-display font-bold text-5xl md:text-7xl leading-none tracking-tight">
            <span className="gradient-text">AI</span> for You.
          </h1>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-white">
            Learn<span className="text-purple-500">.</span> Build
            <span className="text-pink-500">.</span> Succeed
            <span className="text-amber-500">.</span>
          </h2>
          <p className="max-w-md text-base md:text-lg text-muted-foreground">
            Practical AI courses designed for creators, professionals, and future-builders.
          </p>
          <div className="pt-2">
            <Link
              to="/courses"
              className="btn-gradient px-8 py-3.5 rounded-full inline-flex items-center gap-2 text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-purple-500/20"
            >
              Start Your AI Journey →
            </Link>
          </div>

          {/* Key Points */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg">
            <div className="flex items-start gap-2">
              <GraduationCap className="size-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Learn</h4>
                <p className="text-xs text-muted-foreground">Step-by-step</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Rocket className="size-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Apply</h4>
                <p className="text-xs text-muted-foreground">Real-world Skills</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Achieve</h4>
                <p className="text-xs text-muted-foreground">Greater Tomorrow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Beautiful Tilted Cards Deck */}
        <div className="relative lg:w-1/2 h-[450px] md:h-[500px] flex items-center justify-center w-full z-10 select-none">
          {/* Circular Badge - Top Right */}
          <div className="absolute top-0 right-2 md:right-8 z-20 animate-pulse">
            <div className="relative size-24 rounded-full border border-purple-500/50 bg-purple-950/40 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest leading-none">
                Practical
              </span>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest leading-none mt-0.5">
                AI Skills
              </span>
              <span className="text-[8px] font-semibold text-white/80 mt-1">Real Results</span>
            </div>
          </div>

          {/* Cards Container */}
          <div className="relative w-full max-w-md h-full flex items-center justify-center">
            {/* Card 1: Digital Marketer (Red/Orange) */}
            <div className="absolute left-[2%] rotate-[-15deg] translate-y-6 hover:translate-y-0 hover:-rotate-12 transition-all duration-300 w-32 md:w-40 aspect-[2/3] rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/80 to-black p-4 flex flex-col justify-between shadow-2xl">
              <span className="text-[9px] font-bold tracking-wider uppercase text-red-400">
                Digital Marketer
              </span>
              <div className="flex-1 flex items-center justify-center">
                <Megaphone className="size-8 md:size-10 text-red-500 opacity-80" />
              </div>
            </div>

            {/* Card 2: Freelancer (Gold) */}
            <div className="absolute left-[16%] rotate-[-8deg] translate-y-3 hover:translate-y-0 hover:-rotate-4 transition-all duration-300 w-32 md:w-40 aspect-[2/3] rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/80 to-black p-4 flex flex-col justify-between shadow-2xl z-[2]">
              <span className="text-[9px] font-bold tracking-wider uppercase text-amber-400">
                Freelancer
              </span>
              <div className="flex-1 flex items-center justify-center">
                <User className="size-8 md:size-10 text-amber-500 opacity-80" />
              </div>
            </div>

            {/* Card 3: Entrepreneurs (Robot Central Highlighted Card) */}
            <div className="absolute z-[10] scale-105 md:scale-110 -translate-y-2 hover:-translate-y-6 transition-all duration-300 w-40 md:w-48 aspect-[2/3] rounded-2xl border-2 border-purple-500 bg-gradient-to-b from-purple-950 to-black p-4 flex flex-col justify-between shadow-[0_0_45px_rgba(168,85,247,0.5)]">
              <div className="text-center space-y-0.5">
                <span className="text-[8px] font-bold tracking-widest uppercase text-purple-300 block">
                  AI Tools for
                </span>
                <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider block">
                  Entrepreneurs
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden my-2">
                <img
                  src={cuteRobot}
                  alt="AI Robot"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                />
              </div>
              <div className="flex justify-center">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[8px] font-semibold text-purple-300 border border-purple-500/30">
                  Active
                </span>
              </div>
            </div>

            {/* Card 4: Graphic Designer (Orange) */}
            <div className="absolute right-[16%] rotate-[8deg] translate-y-3 hover:translate-y-0 hover:rotate-4 transition-all duration-300 w-32 md:w-40 aspect-[2/3] rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-950/80 to-black p-4 flex flex-col justify-between shadow-2xl z-[2]">
              <span className="text-[9px] font-bold tracking-wider uppercase text-orange-400">
                Graphic Designer
              </span>
              <div className="flex-1 flex items-center justify-center">
                <PenTool className="size-8 md:size-10 text-orange-500 opacity-80" />
              </div>
            </div>

            {/* Card 5: Content Creator (Dark Blue) */}
            <div className="absolute right-[2%] rotate-[15deg] translate-y-6 hover:translate-y-0 hover:rotate-12 transition-all duration-300 w-32 md:w-40 aspect-[2/3] rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/80 to-black p-4 flex flex-col justify-between shadow-2xl">
              <span className="text-[9px] font-bold tracking-wider uppercase text-blue-400">
                Content Creator
              </span>
              <div className="flex-1 flex items-center justify-center">
                <Video className="size-8 md:size-10 text-blue-500 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromptLibrary() {
  const [promptsList, setPromptsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("prompts")
      .select("*")
      .neq("category", "AI News")
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setPromptsList(data.filter((p) => p.category !== "AI News"));
        setLoading(false);
      });
  }, []);

  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">Free Resource</div>
            <h2 className="mt-2 font-display font-bold text-4xl md:text-5xl text-neutral-900">
              Prompt Library
            </h2>
            <p className="mt-3 max-w-lg text-neutral-600">
              A curated collection of battle-tested prompts you can copy and run in seconds.
            </p>
          </div>
          <Link to="/prompt-library" className="btn-gradient">
            See All Prompts →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-purple-600" />
          </div>
        ) : promptsList.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-sm">
            No prompts added yet. Go to Admin Panel to add some prompts!
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {promptsList.map((p, i) => (
              <Link
                key={p.id}
                to="/prompt-library"
                className="rounded-2xl bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
              >
                <div className="h-52 relative bg-purple-950/20 overflow-hidden shrink-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: [
                          "linear-gradient(135deg,#c084fc,#f472b6)",
                          "linear-gradient(135deg,#60a5fa,#a78bfa)",
                          "linear-gradient(135deg,#fb923c,#f472b6)",
                          "linear-gradient(135deg,#34d399,#60a5fa)",
                        ][i % 4]!,
                      }}
                    />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                      {p.category}
                    </span>
                    <h3 className="font-display font-semibold text-neutral-900 text-sm leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SlowWork() {
  return (
    <section className="relative py-24 grid-glow">
      <div className="mx-auto max-w-7xl px-5">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-6xl">
            AI isn't <em className="gradient-text not-italic">replacing</em> you
            <br />
            it's replacing <em className="gradient-text not-italic">slow work!</em>
          </h2>
          <p className="mt-6 text-muted-foreground">
            One platform. Every AI skill you need. Start learning, today.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillTracks.map((s) => (
            <div
              key={s.title}
              className="surface-card p-6 hover:-translate-y-1 hover:border-primary/40 transition"
            >
              <div className="size-10 rounded-xl grid place-items-center gradient-bg text-white font-bold">
                {s.icon}
              </div>
              <h3 className="mt-4 font-display font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <div className="mt-4 text-sm gradient-text font-medium">Learn More →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsPreview({ newsList }: { newsList: DynamicNewsArticle[] }) {
  if (newsList.length === 0) return null;
  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Every Weekday
            </div>
            <h2 className="mt-2 font-display font-bold text-4xl md:text-5xl text-neutral-900">
              Daily AI News
            </h2>
            <p className="mt-3 max-w-lg text-neutral-600">
              The stories moving AI — decoded in under 3 minutes.
            </p>
          </div>
          <Link to="/ai-news" className="btn-gradient">
            Browse Latest AI News →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {newsList.slice(0, 4).map((n) => (
            <Link
              key={n.id}
              to="/ai-news/$id"
              params={{ id: n.id }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-950 border border-neutral-200/50 shadow-md flex flex-col justify-end p-5 hover:-translate-y-1.5 transition-all duration-300 block"
            >
              {n.cover_url ? (
                <img
                  src={n.cover_url}
                  alt={n.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-900 to-purple-950/70" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 inline-block">
                  {n.tag || n.category || "AI News"}
                </span>
                <h3 className="font-display font-bold text-sm md:text-base text-white leading-snug drop-shadow-md group-hover:text-purple-200 transition-colors line-clamp-3">
                  {n.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningMaterials() {
  const cards = [
    {
      title: "Master Creative Design with AI",
      pills: ["25+ Tools", "24 Hr Live Classes", "Lifetime Access"],
      badge: null,
      href: "/courses/creative-ai-community",
    },
    {
      title: "Use Claude Better Than 99% of People & Businesses",
      pills: ["Prompt Systems", "Team Workflows", "Coming Soon"],
      badge: "Coming Soon",
      href: "/courses/creative-ai-community",
    },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-5xl">
            Learning Materials That Make You{" "}
            <span className="gradient-text">Better, Faster, Smarter</span> With AI
          </h2>
        </div>
        <div className="mt-14 space-y-6">
          {cards.map((c) => (
            <Link
              key={c.title}
              to={c.href}
              className="surface-card grid md:grid-cols-[1.2fr_1fr] items-center gap-6 overflow-hidden group"
            >
              <div className="p-8 md:p-10">
                {c.badge && (
                  <span className="eyebrow gradient-text border-primary/30">{c.badge}</span>
                )}
                <h3 className="mt-3 font-display font-bold text-2xl md:text-3xl">{c.title}</h3>
                <div className="mt-6 flex flex-wrap gap-2">
                  {c.pills.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-white/5"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-6 gradient-text font-semibold">Explore →</div>
              </div>
              <img
                src={laptopMockup}
                alt=""
                loading="lazy"
                width={1200}
                height={800}
                className="w-full h-full object-cover md:rounded-l-none rounded-b-2xl md:rounded-r-2xl"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ experts }: { experts: DynamicExpert[] }) {
  if (experts.length === 0) return null;
  return (
    <section id="experts" className="section-light py-20">
      <div className="mx-auto max-w-7xl px-5">
        <h2 className="text-center font-display font-bold text-4xl md:text-5xl text-neutral-900">
          Experts Recommending <span className="gradient-text">AI School</span>
        </h2>
        <p className="mt-3 text-center text-neutral-600 max-w-xl mx-auto">
          A growing community of professionals, founders and creators trust our approach.
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="rounded-2xl bg-white border border-neutral-200 overflow-hidden"
            >
              <div className="aspect-[4/5] gradient-bg grid place-items-center text-white text-5xl font-display font-bold overflow-hidden">
                {expert.avatar_url ? (
                  <img
                    src={expert.avatar_url}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{expert.initials || expert.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="p-4 text-center">
                <div className="font-semibold text-neutral-900">{expert.name}</div>
                <div className="text-xs text-neutral-500 mt-1">{expert.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workshops() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <div className="eyebrow">Enterprise & Institutions</div>
          <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl">
            <span className="gradient-text">AI Workshops</span> & Business Automations
          </h2>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {workshops.map((w) => (
            <div key={w.title} className="surface-card p-8">
              <div className="text-3xl">{w.icon}</div>
              <h3 className="mt-4 font-display font-semibold text-xl">{w.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{w.desc}</p>
              <div className="mt-6 text-sm gradient-text font-medium">Talk to us →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-5">
        <div className="surface-card grid md:grid-cols-2 items-center gap-8 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 size-72 rounded-full gradient-bg opacity-20 blur-3xl" />
          <div>
            <h3 className="font-display font-bold text-3xl md:text-4xl">
              Get smarter about AI — <span className="gradient-text">every week</span>
            </h3>
            <p className="mt-3 text-muted-foreground">
              A short, useful email. New prompts, tools, and workflows straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
