import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Shield,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle,
  Loader2,
  X,
  Layers,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCourses,
  fetchExperts,
  fetchPricingPlans,
  type DynamicCourse,
  type DynamicExpert,
  type DynamicPricingPlan,
} from "@/lib/site-api";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Admin Panel — My Course" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"courses" | "experts" | "pricing">("courses");

  // Courses State
  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [experts, setExperts] = useState<DynamicExpert[]>([]);
  const [plans, setPlans] = useState<DynamicPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Course
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [cSlug, setCSlug] = useState("");
  const [cTitle, CSetTitle] = useState("");
  const [cSubtitle, CSetSubtitle] = useState("");
  const [cDescription, CSetDescription] = useState("");
  const [cPrice, CSetPrice] = useState("1,900");
  const [cPeriod, CSetPeriod] = useState("month");
  const [cStatus, CSetStatus] = useState("active");
  const [cTopics, CSetTopics] = useState(
    "AI Generation, Text-to-Video, UGC Ads, Landing Page Design",
  );
  const [saving, setSaving] = useState(false);

  // Modal State for Expert
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [exName, setExName] = useState("");
  const [exRole, setExRole] = useState("");
  const [exInitials, setExInitials] = useState("");

  // Modal State for Pricing Plan
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("1,900");
  const [pPeriod, setPPeriod] = useState("month");
  const [pBadge, setPBadge] = useState("");
  const [pFeatures, setPFeatures] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const [cData, eData, pData] = await Promise.all([
      fetchCourses(),
      fetchExperts(),
      fetchPricingPlans(),
    ]);
    setCourses(cData);
    setExperts(eData);
    setPlans(pData);
    setLoading(false);
  }

  // Handle Course Create/Edit
  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!cTitle.trim() || !cSlug.trim()) {
      return toast.error("Course Title and Slug are required.");
    }
    setSaving(true);

    const topicsArray = cTopics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const coursePayload = {
      slug: cSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      title: cTitle.trim(),
      subtitle: cSubtitle.trim(),
      description: cDescription.trim(),
      price: cPrice.trim(),
      period: cPeriod,
      status: cStatus,
      topics: topicsArray,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingCourseId && !editingCourseId.startsWith("1")) {
      const res = await supabase.from("courses").update(coursePayload).eq("id", editingCourseId);
      error = res.error;
    } else {
      const res = await supabase.from("courses").insert(coursePayload);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingCourseId ? "Course updated!" : "New course added successfully!");
      setShowCourseModal(false);
      resetCourseForm();
      loadAllData();
    }
  }

  async function handleDeleteCourse(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Course deleted.");
      loadAllData();
    }
  }

  function resetCourseForm() {
    setEditingCourseId(null);
    setCSlug("");
    CSetTitle("");
    CSetSubtitle("");
    CSetDescription("");
    CSetPrice("1,900");
    CSetPeriod("month");
    CSetStatus("active");
    CSetTopics("AI Generation, Text-to-Video, UGC Ads, Landing Page Design");
  }

  function openEditCourse(c: DynamicCourse) {
    setEditingCourseId(c.id);
    setCSlug(c.slug);
    CSetTitle(c.title);
    CSetSubtitle(c.subtitle || "");
    CSetDescription(c.description || "");
    CSetPrice(c.price);
    CSetPeriod(c.period);
    CSetStatus(c.status);
    CSetTopics(Array.isArray(c.topics) ? c.topics.join(", ") : "");
    setShowCourseModal(true);
  }

  // Handle Expert Create
  async function handleSaveExpert(e: React.FormEvent) {
    e.preventDefault();
    if (!exName.trim()) return toast.error("Expert Name is required.");
    setSaving(true);
    const initials =
      exInitials.trim() ||
      exName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const { error } = await supabase.from("experts").insert({
      name: exName.trim(),
      role: exRole.trim(),
      initials,
    });

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Expert / Instructor added!");
      setShowExpertModal(false);
      setExName("");
      setExRole("");
      setExInitials("");
      loadAllData();
    }
  }

  async function handleDeleteExpert(id: string) {
    if (!confirm("Delete this expert?")) return;
    const { error } = await supabase.from("experts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Expert deleted.");
      loadAllData();
    }
  }

  // Handle Pricing Save
  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!pName.trim() || !pPrice.trim()) return toast.error("Plan name and price required.");
    setSaving(true);

    const featuresArr = pFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const planPayload = {
      name: pName.trim(),
      price: pPrice.trim(),
      period: pPeriod,
      badge: pBadge.trim() || null,
      features: featuresArr,
    };

    let error;
    if (editingPlanId) {
      const res = await supabase.from("pricing_plans").update(planPayload).eq("id", editingPlanId);
      error = res.error;
    } else {
      const res = await supabase.from("pricing_plans").insert(planPayload);
      error = res.error;
    }

    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Pricing plan saved!");
      setShowPlanModal(false);
      setEditingPlanId(null);
      loadAllData();
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    const { error } = await supabase.from("pricing_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Plan deleted.");
      loadAllData();
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Access Control Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <main className="pt-32 pb-24 max-w-2xl mx-auto px-5 text-center">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-400 grid place-items-center mx-auto text-2xl border border-amber-500/20">
            <Shield />
          </div>
          <h1 className="mt-5 font-display font-bold text-3xl">Admin Access Required</h1>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Your account (<span className="text-foreground font-semibold">{user?.email}</span>) does
            not have Admin permissions. Please contact the administrator or run the Admin role
            assignment SQL script in Supabase.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/dashboard" className="btn-gradient text-sm">
              Back to Student Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-5">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="size-3.5" /> Admin Control Panel
              </div>
              <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl">
                Manage <span className="gradient-text">My Course</span> Platform
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetCourseForm();
                  setShowCourseModal(true);
                }}
                className="btn-gradient text-sm inline-flex items-center gap-2"
              >
                <Plus className="size-4" /> Add New Course
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Courses</span>
                <BookOpen className="size-4 text-purple-400" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl gradient-text">
                {courses.length}
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Experts & Instructors</span>
                <Users className="size-4 text-pink-400" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl gradient-text">
                {experts.length}
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Pricing Plans</span>
                <DollarSign className="size-4 text-emerald-400" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl gradient-text">
                {plans.length}
              </div>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex gap-2 mt-10 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "courses"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              📚 Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("experts")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "experts"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              🎓 Experts / Instructors ({experts.length})
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "pricing"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              💳 Pricing Tiers ({plans.length})
            </button>
          </div>

          {/* TAB 1: COURSES MANAGEMENT */}
          {activeTab === "courses" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl">All Courses Catalog</h3>
                <button
                  onClick={() => {
                    resetCourseForm();
                    setShowCourseModal(true);
                  }}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Course
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Loading courses...
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              c.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {c.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            /courses/{c.slug}
                          </span>
                        </div>
                        <h4 className="mt-2 font-display font-bold text-xl text-foreground">
                          {c.title}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{c.subtitle}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-purple-400">
                          <span>
                            Price: ৳{c.price} / {c.period}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditCourse(c)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-border hover:bg-white/5 flex items-center gap-1.5"
                        >
                          <Edit className="size-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPERTS MANAGEMENT */}
          {activeTab === "experts" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl">Instructors & Experts</h3>
                <button
                  onClick={() => setShowExpertModal(true)}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Expert
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {experts.map((ex) => (
                  <div key={ex.id} className="surface-card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full gradient-bg grid place-items-center text-white font-bold text-sm">
                        {ex.initials || "EX"}
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-base">{ex.name}</h4>
                        <p className="text-xs text-muted-foreground">{ex.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExpert(ex.id)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PRICING MANAGEMENT */}
          {activeTab === "pricing" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl">Membership Pricing Tiers</h3>
                <button
                  onClick={() => {
                    setEditingPlanId(null);
                    setPName("");
                    setPPrice("1,900");
                    setPPeriod("month");
                    setPBadge("");
                    setPFeatures("");
                    setShowPlanModal(true);
                  }}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Plan
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div key={p.id} className="surface-card p-6 flex flex-col justify-between">
                    <div>
                      {p.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3 inline-block">
                          {p.badge}
                        </span>
                      )}
                      <h4 className="font-display font-bold text-xl">{p.name}</h4>
                      <div className="mt-2 font-display font-bold text-3xl gradient-text">
                        ৳{p.price}{" "}
                        <span className="text-xs text-muted-foreground">/ {p.period}</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="size-3 text-purple-400" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingPlanId(p.id);
                          setPName(p.name);
                          setPPrice(p.price);
                          setPPeriod(p.period);
                          setPBadge(p.badge || "");
                          setPFeatures(p.features.join("\n"));
                          setShowPlanModal(true);
                        }}
                        className="text-xs font-semibold text-purple-400 hover:underline"
                      >
                        Edit Plan
                      </button>
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD / EDIT COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-xl rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-5">
              {editingCourseId ? "Edit Course" : "Add New Course"}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => CSetTitle(e.target.value)}
                  placeholder="e.g. Creative AI Community"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Course Slug (URL identifier)
                </label>
                <input
                  type="text"
                  required
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  placeholder="creative-ai-community"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Subtitle / Short Tagline
                </label>
                <input
                  type="text"
                  value={cSubtitle}
                  onChange={(e) => CSetSubtitle(e.target.value)}
                  placeholder="The community for creators building with AI..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Price (BDT)
                  </label>
                  <input
                    type="text"
                    value={cPrice}
                    onChange={(e) => CSetPrice(e.target.value)}
                    placeholder="1,900"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Period
                  </label>
                  <select
                    value={cPeriod}
                    onChange={(e) => CSetPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="month">month</option>
                    <option value="year">year</option>
                    <option value="one-time">one-time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={cStatus}
                    onChange={(e) => CSetStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">active</option>
                    <option value="enrolling">enrolling</option>
                    <option value="coming_soon">coming_soon</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Topics (comma separated)
                </label>
                <input
                  type="text"
                  value={cTopics}
                  onChange={(e) => CSetTopics(e.target.value)}
                  placeholder="AI Generation, Text-to-Video, UGC Ads, Landing Pages"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={cDescription}
                  onChange={(e) => CSetDescription(e.target.value)}
                  placeholder="Full course description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPERT */}
      {showExpertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowExpertModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-5">Add New Expert / Instructor</h3>
            <form onSubmit={handleSaveExpert} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  placeholder="e.g. Tanvir Islam"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={exRole}
                  onChange={(e) => setExRole(e.target.value)}
                  placeholder="e.g. Lead AI Instructor"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpertModal(false)}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-gradient text-xs">
                  Save Expert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRICING PLAN */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-5">
              {editingPlanId ? "Edit Plan" : "Add Plan"}
            </h3>
            <form onSubmit={handleSavePlan} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Monthly"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Price (BDT)
                  </label>
                  <input
                    type="text"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="1,900"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Period
                  </label>
                  <input
                    type="text"
                    required
                    value={pPeriod}
                    onChange={(e) => setPPeriod(e.target.value)}
                    placeholder="month / year"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Badge (Optional)
                </label>
                <input
                  type="text"
                  value={pBadge}
                  onChange={(e) => setPBadge(e.target.value)}
                  placeholder="MOST POPULAR"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Features (One line per feature)
                </label>
                <textarea
                  rows={4}
                  value={pFeatures}
                  onChange={(e) => setPFeatures(e.target.value)}
                  placeholder="Full course access&#10;Weekly live classes&#10;Community support"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs"
                />
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-gradient text-xs">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
