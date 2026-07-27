import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import heroSpace from "@/assets/hero-space.jpg";
import personaCreator from "@/assets/persona-creator.jpg";
import laptopMockup from "@/assets/laptop-mockup.jpg";
import { skillTracks, prompts, news, testimonials, workshops } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "E-Course— Learn AI for Real Productivity" },
      {
        name: "description",
        content:
          "Cohort-based AI communities, a curated prompt library and daily AI news. Learn the tools that make you 10x more productive.",
      },
      { property: "og:title", content: "E-Course— Learn AI for Real Productivity" },
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
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <PromptLibrary />
        <SlowWork />
        <NewsPreview />
        <LearningMaterials />
        <Testimonials />
        <Workshops />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={heroSpace}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      <div className="relative mx-auto max-w-7xl px-5 pt-40 pb-24 text-center">
        <span className="eyebrow">✦ Increase your productivity up to 10X</span>
        <h1 className="mt-6 font-display font-bold text-6xl md:text-8xl leading-[0.95]">
          <span className="gradient-text">AI</span> for You.
        </h1>
        <p className="mt-6 mx-auto max-w-xl text-muted-foreground">
          Communities, prompts and daily AI news — everything you need to become fluent in the tools
          rewriting your industry.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/pricing" className="btn-gradient">
            Join a Community →
          </Link>
          <Link to="/prompt-library" className="btn-outline-pill">
            Explore Prompts
          </Link>
        </div>

        {/* Persona card */}
        <div className="relative mt-20 mx-auto max-w-sm">
          <div className="surface-card overflow-hidden rounded-3xl shadow-[0_20px_80px_-20px_oklch(0.6_0.24_320/0.5)]">
            <img
              src={personaCreator}
              alt="Creator persona"
              width={800}
              height={1000}
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="p-5 text-left">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Persona</div>
              <div className="mt-1 font-display font-bold text-2xl gradient-text">Entrepreneur</div>
            </div>
          </div>
          <div className="absolute -inset-8 -z-10 rounded-full blur-3xl gradient-bg opacity-30" />
        </div>
      </div>
    </section>
  );
}

function PromptLibrary() {
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

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {prompts.slice(0, 4).map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition"
            >
              <div
                className="aspect-[4/5] bg-gradient-to-br"
                style={{
                  background: [
                    "linear-gradient(135deg,#c084fc,#f472b6)",
                    "linear-gradient(135deg,#60a5fa,#a78bfa)",
                    "linear-gradient(135deg,#fb923c,#f472b6)",
                    "linear-gradient(135deg,#34d399,#60a5fa)",
                  ][i]!,
                }}
              />
              <div className="p-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                  {p.category} · {p.tool}
                </span>
                <h3 className="mt-1 font-display font-semibold text-neutral-900 text-sm leading-snug">
                  {p.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
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

function NewsPreview() {
  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">Every Weekday</div>
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
          {news.slice(0, 4).map((n, i) => (
            <div key={n.title} className="relative rounded-2xl overflow-hidden aspect-[4/5] group">
              <div
                className="absolute inset-0"
                style={{
                  background: [
                    "linear-gradient(180deg,#7c3aed,#0a0a0f)",
                    "linear-gradient(180deg,#ec4899,#0a0a0f)",
                    "linear-gradient(180deg,#f97316,#0a0a0f)",
                    "linear-gradient(180deg,#3b82f6,#0a0a0f)",
                  ][i]!,
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <span className="text-[10px] uppercase tracking-widest opacity-80">{n.tag}</span>
                <h3 className="mt-1 font-display font-bold text-lg leading-snug">{n.title}</h3>
              </div>
            </div>
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

function Testimonials() {
  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-7xl px-5">
        <h2 className="text-center font-display font-bold text-4xl md:text-5xl text-neutral-900">
          Experts Recommending <span className="gradient-text">My Course</span>
        </h2>
        <p className="mt-3 text-center text-neutral-600 max-w-xl mx-auto">
          A growing community of professionals, founders and creators trust our approach.
        </p>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-white border border-neutral-200 overflow-hidden"
            >
              <div className="aspect-[4/5] gradient-bg grid place-items-center text-white text-5xl font-display font-bold">
                {t.initials}
              </div>
              <div className="p-4 text-center">
                <div className="font-semibold text-neutral-900">{t.name}</div>
                <div className="text-xs text-neutral-500 mt-1">{t.role}</div>
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
