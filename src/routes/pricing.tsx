import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { course } from "@/lib/site-data";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "৳1,900",
    period: "/month",
    perks: [
      "Full Creative AI Community access",
      "New lessons every week",
      "2 live sessions per month",
      "Prompt library access",
    ],
    featured: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "৳17,900",
    period: "/year",
    perks: [
      "Everything in Monthly",
      "2 months free",
      "Priority feedback on your work",
      "Private freelancing job board",
    ],
    featured: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "৳39,900",
    period: "one-time",
    perks: [
      "Lifetime community access",
      "All future course tracks",
      "1:1 onboarding call",
      "Workshop invites",
    ],
    featured: false,
  },
] as const;

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Membership & Pricing — My Course" },
      {
        name: "description",
        content:
          "Join the Creative AI Community. Monthly, yearly and lifetime memberships with live sessions, weekly lessons and the full prompt library.",
      },
      { property: "og:title", content: "Membership & Pricing — My Course" },
      {
        property: "og:description",
        content:
          "Monthly, yearly and lifetime My Course memberships — live sessions, weekly lessons and the full prompt library.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<string | null>(null);

  async function join(planId: string) {
    if (!user) {
      navigate({
        to: "/auth",
        search: { mode: "signup", redirect: "/pricing" },
      });
      return;
    }
    setPending(planId);
    const { error } = await supabase.from("enrollments").upsert(
      {
        user_id: user.id,
        course_slug: course.slug,
        course_title: course.title,
        plan: planId,
        status: "active",
      },
      { onConflict: "user_id,course_slug" },
    );
    setPending(null);
    if (error) {
      toast.error("Could not complete enrollment. Please try again.");
      return;
    }
    toast.success(`You're in! ${planId} membership activated.`);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <div className="eyebrow">✦ Membership</div>
            <h1 className="mt-5 font-display font-bold text-5xl md:text-7xl">
              Join <span className="gradient-text">Today</span>
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-muted-foreground">
              One membership, every track. Cancel anytime. Payments in BDT via bKash and SSLCommerz.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`surface-card p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1 ${
                  p.featured ? "ring-1 ring-primary/50" : ""
                }`}
              >
                {p.featured && <span className="self-start eyebrow mb-4">Most popular</span>}
                <h2 className="font-display font-semibold text-xl">{p.name}</h2>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display font-bold text-4xl gradient-text">{p.price}</span>
                  <span className="text-sm text-muted-foreground pb-1">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex gap-2">
                      <Check className="size-4 mt-0.5 text-primary shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => join(p.id)}
                  disabled={pending !== null}
                  className={`mt-8 inline-flex items-center justify-center gap-2 disabled:opacity-60 ${
                    p.featured ? "btn-gradient" : "btn-outline-pill"
                  }`}
                >
                  {pending === p.id && <Loader2 className="size-4 animate-spin" />}
                  {user ? "Join Today →" : "Get started →"}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Want to see what's inside first?{" "}
            <Link
              to="/courses/$slug"
              params={{ slug: course.slug }}
              className="gradient-text font-medium"
            >
              Explore the community →
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
