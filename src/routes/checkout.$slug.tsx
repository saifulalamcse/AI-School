import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Lock,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchCourseBySlug, type DynamicCourse } from "@/lib/site-api";
import { useAuth } from "@/lib/auth";
import personaCreator from "@/assets/persona-creator.jpg";

export const Route = createFileRoute("/checkout/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Checkout — My Course` },
      { name: "description", content: "Complete your course enrollment securely." },
      { property: "og:title", content: "Checkout — My Course" },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "bkash" | "nagad" | "card";

function CheckoutPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [courseData, setCourseData] = useState<DynamicCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bkash");
  const [mfsNumber, setMfsNumber] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCourseBySlug(slug).then((data) => {
      setCourseData(data);
      setLoading(false);
    });
  }, [slug]);

  // If user is not logged in, redirect to login with redirect back to this checkout
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please login or register to complete your enrollment.");
      navigate({
        to: "/auth",
        search: { mode: "login", redirect: `/checkout/${slug}` },
      });
    }
  }, [user, authLoading, slug, navigate]);

  const handleEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return navigate({
        to: "/auth",
        search: { mode: "login", redirect: `/checkout/${slug}` },
      });
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !mfsNumber.trim()) {
      return toast.error(
        `Please enter your ${paymentMethod === "bkash" ? "bKash" : "Nagad"} mobile number.`,
      );
    }

    setProcessing(true);

    try {
      const courseTitle = courseData?.title || "Creative AI Community";
      const coursePlan = courseData
        ? `৳${courseData.price} / ${courseData.period}`
        : "৳1,900 / month";

      // Insert enrollment record into Supabase
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_slug: slug,
        course_title: courseTitle,
        plan: coursePlan,
        status: "active",
      });

      if (error) {
        // If error is duplicate entry, still treat as success
        if (error.code !== "23505") {
          throw error;
        }
      }

      toast.success(`🎉 Congratulations! You have successfully enrolled in ${courseTitle}!`);

      // Redirect to Dashboard
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1000);
    } catch (err: unknown) {
      console.error("Enrollment error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to complete enrollment. Please try again.";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const name = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const email = user?.email || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-6">
            <Link
              to="/courses/$slug"
              params={{ slug }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="size-3.5" /> Back to course page
            </Link>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Course Order Summary */}
            <div className="md:col-span-6 space-y-6">
              <div className="surface-card p-6 md:p-8">
                <div className="eyebrow mb-3">✦ Order Summary</div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                  {courseData?.title || "Creative AI Community"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {courseData?.subtitle ||
                    courseData?.description ||
                    "Master Creative design with AI workflows."}
                </p>

                <div className="mt-6 aspect-video rounded-2xl overflow-hidden border border-border bg-black/40 relative">
                  <img
                    src={courseData?.thumbnail_url || personaCreator}
                    alt={courseData?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold gradient-bg text-white shadow-lg">
                    Instant Access
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Course Access:</span>
                    <span className="font-semibold text-foreground">Lifetime Access</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Billing Cycle:</span>
                    <span className="font-semibold text-foreground">
                      {courseData?.period === "one-time"
                        ? "One-time Payment"
                        : `Per ${courseData?.period || "month"}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base pt-3 border-t border-border font-bold text-foreground">
                    <span>Total Amount:</span>
                    <span className="font-display text-2xl gradient-text">
                      ৳{courseData?.price || "1,900"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-3">
                  <ShieldCheck className="size-5 shrink-0 text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">100% Satisfaction Guarantee</p>
                    <p className="mt-0.5 opacity-90">
                      Access all weekly lessons, community Discord, live Q&A sessions, and prompt
                      templates immediately after enrollment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Billing & Payment Selection */}
            <div className="md:col-span-6 space-y-6">
              <div className="surface-card p-6 md:p-8">
                <h2 className="font-display font-bold text-2xl mb-6 flex items-center justify-between">
                  <span>Checkout & Payment</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Lock className="size-3.5" /> 256-bit SSL Secure
                  </span>
                </h2>

                <form onSubmit={handleEnrollment} className="space-y-6">
                  {/* Account Information */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Account Details
                    </label>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1.5">
                      <div className="text-sm font-semibold text-foreground">{name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{email}</div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* bKash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bkash")}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                          paymentMethod === "bkash"
                            ? "bg-pink-500/20 border-pink-500 text-white shadow-lg"
                            : "bg-card border-border text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        <Wallet className="size-6 text-pink-400" />
                        <span className="text-xs font-bold">bKash</span>
                      </button>

                      {/* Nagad */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("nagad")}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                          paymentMethod === "nagad"
                            ? "bg-orange-500/20 border-orange-500 text-white shadow-lg"
                            : "bg-card border-border text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        <Smartphone className="size-6 text-orange-400" />
                        <span className="text-xs font-bold">Nagad</span>
                      </button>

                      {/* Card / SSLCommerz */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                          paymentMethod === "card"
                            ? "bg-purple-500/20 border-purple-500 text-white shadow-lg"
                            : "bg-card border-border text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        <CreditCard className="size-6 text-purple-400" />
                        <span className="text-xs font-bold">Card / SSL</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Details Input */}
                  {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                    <div className="space-y-2 p-4 rounded-2xl bg-card border border-border">
                      <label className="block text-xs font-semibold text-muted-foreground">
                        Your {paymentMethod === "bkash" ? "bKash" : "Nagad"} Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value)}
                        placeholder="01700000000"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Enter your mobile number to authorize quick payment.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="p-4 rounded-2xl bg-card border border-border text-xs text-muted-foreground space-y-2">
                      <p className="font-semibold text-foreground">
                        Credit / Debit Card (SSLCommerz Gateway)
                      </p>
                      <p>Supports Visa, Mastercard, AMEX, and all Bangladeshi Bank Cards.</p>
                    </div>
                  )}

                  {/* Complete Enrollment Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 rounded-2xl btn-gradient font-bold text-base shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        <span>Pay ৳{courseData?.price || "1,900"} & Complete Enrollment</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    By completing enrollment, you agree to our Terms of Service.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
