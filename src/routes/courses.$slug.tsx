import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { course as fallbackCourse, testimonials } from "@/lib/site-data";
import { fetchCourseBySlug, type DynamicCourse } from "@/lib/site-api";
import mountainJourney from "@/assets/mountain-journey.jpg";
import personaCreator from "@/assets/persona-creator.jpg";
import laptopMockup from "@/assets/laptop-mockup.jpg";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Course Details — AI School` },
      {
        name: "description",
        content:
          "Join AI School masterclasses. 25+ hours of content, new lessons every week, and 2 live sessions a month.",
      },
      { property: "og:title", content: "Course Details — AI School" },
      {
        property: "og:description",
        content: `Master AI design and productivity. (${params.slug})`,
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { slug } = Route.useParams();
  const [courseData, setCourseData] = useState<DynamicCourse | null>(null);

  useEffect(() => {
    setCourseData(null);
    fetchCourseBySlug(slug).then((data) => setCourseData(data));
  }, [slug]);

  if (!courseData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
          <Loader2 className="size-10 animate-spin text-purple-500 mb-4" />
          <p className="text-sm text-neutral-600 font-medium animate-pulse">
            Loading course masterclass...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const activeCourse = courseData;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <CourseHero activeCourse={activeCourse} />
        <VideoSection activeCourse={activeCourse} />
        <TopicsSection activeCourse={activeCourse} />
        <TopOnePercent activeCourse={activeCourse} />
        <InsideCommunity activeCourse={activeCourse} />
        <FeaturedCreatives />
        <GalleryStrip />
        <RecapCta activeCourse={activeCourse} />
        <InstructorStrip />
      </main>
      <Footer />
    </div>
  );
}

function CourseHero({ activeCourse }: { activeCourse: DynamicCourse }) {
  return (
    <section className="relative pt-32 pb-20 grid-glow">
      <div className="mx-auto max-w-5xl px-5 text-center">
        <div className="eyebrow">✦ {activeCourse.title}</div>
        <h1 className="mt-6 font-display font-bold text-5xl md:text-7xl leading-tight">
          <span className="gradient-text">{activeCourse.title}</span>
        </h1>
        <p className="mt-5 mx-auto max-w-2xl text-muted-foreground text-lg">
          {activeCourse.subtitle || activeCourse.description}
        </p>

        {activeCourse.thumbnail_url && (
          <div className="mt-8 mx-auto max-w-3xl rounded-3xl overflow-hidden border border-border shadow-2xl">
            <img
              src={activeCourse.thumbnail_url}
              alt={activeCourse.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Tool badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {(activeCourse.tools && activeCourse.tools.length > 0
            ? activeCourse.tools
            : ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"]
          ).map((tool) => (
            <span
              key={tool}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-100/90 border border-neutral-300 text-neutral-800 shadow-xs"
            >
              {tool}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {(activeCourse.stats || fallbackCourse.stats).map((s, idx) => (
            <div
              key={s.label + idx}
              className="surface-card p-4 text-center min-w-[170px] sm:min-w-[190px] flex-1 sm:flex-initial"
            >
              <div className="font-display font-bold text-xl gradient-text">{s.label}</div>
              <div className="text-xs text-neutral-600 font-medium mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/checkout/$slug" params={{ slug: activeCourse.slug }} className="btn-gradient">
            Join Today →
          </Link>
        </div>
      </div>
    </section>
  );
}

function VideoSection({ activeCourse }: { activeCourse: DynamicCourse }) {
  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-neutral-900">
          Become a <span className="gradient-text">Creative AI</span> Director
        </h2>
        <p className="mt-4 text-neutral-600">Watch the 2-minute intro from your community lead.</p>
        <div className="mt-10 rounded-3xl overflow-hidden bg-black aspect-video relative group cursor-pointer border border-neutral-200">
          <img
            src={activeCourse.thumbnail_url || personaCreator}
            alt="Video poster"
            loading="lazy"
            width={800}
            height={1000}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="size-20 rounded-full gradient-bg grid place-items-center text-white text-2xl shadow-2xl group-hover:scale-110 transition">
              ▶
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Link to="/checkout/$slug" params={{ slug: activeCourse.slug }} className="btn-gradient">
            Enroll Now →
          </Link>
        </div>
      </div>
    </section>
  );
}

function TopicsSection({ activeCourse }: { activeCourse: DynamicCourse }) {
  const topicsList = activeCourse.topics || fallbackCourse.topics;
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-4xl md:text-5xl">
            Learn AI for <span className="gradient-text">Real Productivity</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            The full stack of skills you need to design, produce and ship at the speed of AI.
          </p>
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-8 items-center">
          <div className="grid sm:grid-cols-2 gap-3">
            {topicsList.map((t, i) => (
              <div key={t} className="surface-card p-4 flex items-center gap-3">
                <div className="size-8 rounded-lg gradient-bg grid place-items-center text-white text-xs font-bold">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-medium">{t}</div>
              </div>
            ))}
          </div>
          <div className="relative">
            <img
              src={laptopMockup}
              alt="Learning dashboard"
              loading="lazy"
              width={1200}
              height={800}
              className="rounded-3xl border border-border w-full"
            />
            <div className="absolute -inset-6 -z-10 rounded-full blur-3xl gradient-bg opacity-25" />
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link to="/checkout/$slug" params={{ slug: activeCourse.slug }} className="btn-gradient">
            Start Learning →
          </Link>
        </div>
      </div>
    </section>
  );
}

function TopOnePercent({ activeCourse }: { activeCourse: DynamicCourse }) {
  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-5xl px-5 text-center">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-neutral-900">
          Become the <span className="gradient-text">Top 1%</span>
        </h2>
        <p className="mt-4 text-neutral-600 max-w-xl mx-auto">
          Consistency compounds. Show up every week, ship real work, and rise faster than 99% of
          your peers.
        </p>
        <div className="mt-10">
          <img
            src={mountainJourney}
            alt="Journey to the top"
            loading="lazy"
            width={1200}
            height={800}
            className="mx-auto rounded-3xl max-w-2xl w-full"
          />
        </div>
        <div className="mt-8">
          <Link to="/checkout/$slug" params={{ slug: activeCourse.slug }} className="btn-gradient">
            Begin the Journey →
          </Link>
        </div>
      </div>
    </section>
  );
}

function InsideCommunity({ activeCourse }: { activeCourse: DynamicCourse }) {
  const insideList = activeCourse.inside || fallbackCourse.inside;
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl">
            What's inside the <span className="gradient-text">Community?</span>
          </h2>
        </div>
        <div className="mt-14 space-y-10">
          {insideList.map((row) => (
            <div key={row.title} className="surface-card p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-display font-bold text-3xl gradient-text">{row.count}</div>
                  <h3 className="mt-1 font-display font-semibold text-xl">{row.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{row.desc}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-xl border border-border"
                    style={{
                      background: [
                        "linear-gradient(135deg,#7c3aed,#ec4899)",
                        "linear-gradient(135deg,#ec4899,#f97316)",
                        "linear-gradient(135deg,#f97316,#7c3aed)",
                        "linear-gradient(135deg,#3b82f6,#7c3aed)",
                      ][i]!,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/" className="btn-gradient">
            Join the Community →
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedCreatives() {
  const cases = [
    {
      brand: "Studio Nine",
      desc: "Rebranded a footwear label and launched 12 AI-generated campaign shots in a week.",
    },
    {
      brand: "Fresh Roast",
      desc: "Weekly UGC ads produced entirely from prompt-to-video by the founder herself.",
    },
    {
      brand: "Aurora Interiors",
      desc: "AI-generated product visuals grew IG reach 4×; no photoshoot required.",
    },
  ];
  return (
    <section className="section-light py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display font-bold text-4xl md:text-5xl text-neutral-900 text-center">
          Featured Creatives by <span className="gradient-text">AI School</span>
        </h2>
        <div className="mt-12 space-y-6">
          {cases.map((c, i) => (
            <div
              key={c.brand}
              className={`grid md:grid-cols-2 gap-6 items-center bg-white rounded-3xl border border-neutral-200 overflow-hidden ${
                i % 2 ? "md:[&>:first-child]:order-2" : ""
              }`}
            >
              <div
                className="aspect-[4/3] md:aspect-auto md:h-full"
                style={{
                  background: [
                    "linear-gradient(135deg,#7c3aed,#0f172a)",
                    "linear-gradient(135deg,#f97316,#7c3aed)",
                    "linear-gradient(135deg,#059669,#065f46)",
                  ][i]!,
                }}
              />
              <div className="p-8">
                <div className="text-xs uppercase tracking-widest text-neutral-500">Case Study</div>
                <h3 className="mt-2 font-display font-bold text-2xl text-neutral-900">{c.brand}</h3>
                <p className="mt-3 text-neutral-600">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryStrip() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-5 space-y-4">
        {[0, 1].map((row) => (
          <div key={row} className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border border-border"
                style={{
                  background: `linear-gradient(${(i + row) * 45}deg, #7c3aed, #ec4899, #f97316)`,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function RecapCta({ activeCourse }: { activeCourse: DynamicCourse }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-5 text-center surface-card p-12 relative overflow-hidden">
        <div className="absolute -inset-20 -z-10 rounded-full blur-3xl gradient-bg opacity-20" />
        <h2 className="font-display font-bold text-3xl md:text-5xl">
          We help you learn to create <span className="gradient-text">Stunning Creatives</span>{" "}
          using AI Workflows.
        </h2>
        <div className="mt-8">
          <Link to="/checkout/$slug" params={{ slug: activeCourse.slug }} className="btn-gradient">
            Join Today →
          </Link>
        </div>
      </div>
    </section>
  );
}

function InstructorStrip() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center mb-10">
          <div className="eyebrow">We'll Be With You in Your AI Transformation</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="surface-card p-6 text-center">
              <div className="mx-auto size-20 rounded-full gradient-bg grid place-items-center text-white font-display font-bold text-2xl">
                {t.initials}
              </div>
              <div className="mt-4 font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
