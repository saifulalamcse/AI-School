import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { testimonials, workshops } from "@/lib/site-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — My Course" },
      {
        name: "description",
        content:
          "My Course is a learning platform for creators and teams who want to work at the speed of AI.",
      },
      { property: "og:title", content: "About — My Course" },
      {
        property: "og:description",
        content: "Who we are and what we believe about AI education.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-4xl px-5 text-center">
          <div className="eyebrow">✦ About Us</div>
          <h1 className="mt-5 font-display font-bold text-5xl md:text-7xl">
            AI for <span className="gradient-text">Everyone</span> Who Builds.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            My Course is a learning platform for creators, freelancers and teams. We turn
            overwhelming AI toolchains into simple, repeatable workflows you can actually run.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 mt-20 grid md:grid-cols-3 gap-4">
          {[
            {
              n: "01",
              t: "Practical over theoretical",
              d: "Every lesson ends with a workflow you can ship the same day.",
            },
            {
              n: "02",
              t: "Community first",
              d: "You learn faster around people building the same thing.",
            },
            {
              n: "03",
              t: "Always current",
              d: "We update lessons as fast as the tools change — every week.",
            },
          ].map((v) => (
            <div key={v.n} className="surface-card p-8">
              <div className="font-display font-bold text-3xl gradient-text">{v.n}</div>
              <h3 className="mt-3 font-display font-semibold text-xl">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-5 mt-24">
          <h2 className="text-center font-display font-bold text-4xl md:text-5xl">
            The <span className="gradient-text">Team</span>
          </h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <div key={t.name} className="surface-card p-6 text-center">
                <div className="mx-auto size-20 rounded-full gradient-bg grid place-items-center text-white font-bold text-2xl font-display">
                  {t.initials}
                </div>
                <div className="mt-4 font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 mt-24">
          <h2 className="text-center font-display font-bold text-4xl md:text-5xl">
            Work <span className="gradient-text">With Us</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {workshops.map((w) => (
              <div key={w.title} className="surface-card p-8">
                <div className="text-3xl">{w.icon}</div>
                <h3 className="mt-3 font-display font-semibold text-xl">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
