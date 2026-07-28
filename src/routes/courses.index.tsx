import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { course, skillTracks } from "@/lib/site-data";
import { fetchCourses, type DynamicCourse } from "@/lib/site-api";
import personaCreator from "@/assets/persona-creator.jpg";
import laptopMockup from "@/assets/laptop-mockup.jpg";
import mountainJourney from "@/assets/mountain-journey.jpg";
import {
  BookOpen,
  Sparkles,
  Video,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "All Courses — My Course" },
      {
        name: "description",
        content:
          "Explore all AI courses, cohort communities, and masterclasses. Learn AI tools for real productivity.",
      },
      { property: "og:title", content: "All Courses — My Course" },
      {
        property: "og:description",
        content: "Master Creative Design, Video Production, and AI Automations with My Course.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AllCoursesPage,
});

function AllCoursesPage() {
  const [coursesList, setCoursesList] = useState<DynamicCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCoursesList(data);
      setLoading(false);
    });
  }, []);

  const featuredCourse =
    coursesList.find((c) => c.slug === "creative-ai-community") || coursesList[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-5 text-center">
          <div className="eyebrow">✦ All Courses & Programs</div>
          <h1 className="mt-5 font-display font-bold text-5xl md:text-7xl leading-tight">
            Learn AI for <span className="gradient-text">Real Productivity</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            From creative AI design to automations and video production — cohort communities and
            masterclasses designed to elevate your workflow.
          </p>
        </section>

        {/* Featured Banner Course (Matches Reference UI) */}
        <section className="mx-auto max-w-6xl px-5 mt-14">
          <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-neutral-900/90 via-neutral-900 to-purple-950/40 p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-6 relative">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                  <img
                    src={featuredCourse?.thumbnail_url || personaCreator}
                    alt="Creative AI Community preview"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold gradient-bg text-white shadow-lg">
                        Featured Community
                      </span>
                      <h3 className="mt-2 font-display font-bold text-2xl text-white">
                        {featuredCourse?.title || course.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Sparkles className="size-3.5" /> Best of 2026
                  </span>
                  <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl text-white leading-tight">
                    {featuredCourse?.title || "Master Creative Design with AI"}
                  </h2>
                  <p className="mt-2 text-neutral-300 text-sm md:text-base">
                    {featuredCourse?.subtitle ||
                      "25+ AI Tools Use Cases Covered — text-to-video, composite design, UGC ads and landing pages."}
                  </p>
                </div>

                {/* Badges / Tools */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"].map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="font-display font-bold text-lg text-white">24+ Hours</div>
                    <div className="text-[11px] text-neutral-400">Course Duration</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="font-display font-bold text-lg text-white">Live Classes</div>
                    <div className="text-[11px] text-neutral-400">Weekly & Monthly</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="font-display font-bold text-lg text-white">Lifetime</div>
                    <div className="text-[11px] text-neutral-400">Community Access</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    to="/courses/$slug"
                    params={{ slug: featuredCourse?.slug || "creative-ai-community" }}
                    className="btn-gradient inline-flex items-center gap-2"
                  >
                    Explore Course <ArrowRight className="size-4" />
                  </Link>
                  <Link to="/pricing" className="btn-outline-pill text-sm">
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Courses Grid */}
        <section className="mx-auto max-w-6xl px-5 mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="eyebrow">✦ Curriculum</div>
              <h2 className="mt-2 font-display font-bold text-3xl md:text-4xl">
                Browse Our <span className="gradient-text">Masterclasses</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Filter by topic or pick a full cohort learning path to start advancing your skills
              today.
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="size-8 animate-spin mx-auto text-purple-400 mb-2" />
              Loading dynamic courses...
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {coursesList.map((c, idx) => (
                <div
                  key={c.id || c.slug}
                  className="surface-card p-6 flex flex-col justify-between group hover:border-purple-500/50 transition"
                >
                  <div>
                    <div className="aspect-video rounded-2xl overflow-hidden relative border border-border mb-5">
                      <img
                        src={
                          c.thumbnail_url ||
                          [personaCreator, laptopMockup, mountainJourney][idx % 3]
                        }
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground group-hover:text-purple-400 transition">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {c.subtitle || c.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                      {(c.topics || []).slice(0, 3).map((topic) => (
                        <li key={topic} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-purple-400" /> {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-400">
                      ৳{c.price} / {c.period}
                    </span>
                    <Link
                      to="/courses/$slug"
                      params={{ slug: c.slug }}
                      className="btn-gradient text-xs px-4 py-2"
                    >
                      View Course →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Skill Tracks Section */}
        <section className="mx-auto max-w-6xl px-5 mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <div className="eyebrow">✦ Learning Paths</div>
            <h2 className="mt-3 font-display font-bold text-4xl">
              Skill Tracks Covered in <span className="gradient-text">My Course</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Every course and workshop maps to real-world career paths.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {skillTracks.map((st) => (
              <div
                key={st.title}
                className="surface-card p-5 hover:border-purple-500/40 transition"
              >
                <div className="size-9 rounded-xl gradient-bg grid place-items-center text-white font-bold text-sm">
                  {st.icon}
                </div>
                <h4 className="mt-4 font-display font-semibold text-base text-foreground">
                  {st.title}
                </h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
